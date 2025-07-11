<script lang="ts">
	import { goto } from '$app/navigation'
	import { env } from '$env/dynamic/public'
	import { Component, Domain, Interfaces, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'sign-up-in'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		openidendpoints?: Domain.Entities.Iam.OpenIDEndpoints
		session?: Domain.Entities.Iam.Session
		title?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		openidendpoints = undefined,
		session = undefined,
		title = 'Welcome'
	}: Props = $props()

	let loginEndpoint: string | undefined = $derived(openidendpoints?.login_endpoint)

	let registrationEndpoint: string | undefined = $derived(openidendpoints?.registration_endpoint)

	let iamCredential: Domain.Entities.IamCredentials.Interface | undefined = $derived(session?.iam_credential)

	let directory: Domain.Entities.Directory.Interface | undefined = $derived(session?.directory)

	let directoryGroupsSearch = $state(Interfaces.DirectoryGroups.NewViewSearch())
	$effect(() => {
		if (iamCredential) {
			untrack(() => {
				directoryGroupsSearch.authcontextdirectorygroupid = directory?.directory_groups_id && directory?.directory_groups_id[0]
				directoryGroupsSearch.context = COMPONENT_NAME
				directoryGroupsSearch.telemetry = telemetry
			})
		}
	})

	async function handleClickDirectoryGroup(directoryGroup?: Domain.Entities.DirectoryGroups.Interface) {
		if (!Array.isArray(directoryGroup?.id) || directoryGroup.id.length === 0) {
			return
		}

		await goto(
			`${Utils.Env.BasePath}${Domain.Entities.Url.WebsitePaths.Home}?${Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID}=${directoryGroup.id[0]}`
		)
	}
</script>

<div class="flex h-fit w-full flex-col gap-y-1 overflow-hidden p-1">
	<header class="text-center text-2xl font-bold">
		{title}
	</header>

	{#if iamCredential && directoryGroupsSearch.searchmetadatamodel && directoryGroupsSearch.searchresults}
		{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
			<ViewHeaderData
				title="Pick a group to launch..."
				view={directoryGroupsSearch.view}
				updateview={(value) => (directoryGroupsSearch.view = value)}
				{theme}
			></ViewHeaderData>
		{/await}
	{/if}

	<main class="flex flex-col overflow-auto">
		{#if iamCredential}
			{#if directoryGroupsSearch.getdisplaydata}
				{#await directoryGroupsSearch.getdisplaydata() then}
					{#if directoryGroupsSearch.searchmetadatamodel && directoryGroupsSearch.searchresults}
						{#await import('$lib/components/View/DirectoryGroups/Data/Component.svelte') then { default: ViewDirectoryGroupData }}
							<ViewDirectoryGroupData
								metadatamodel={directoryGroupsSearch.searchmetadatamodel}
								data={directoryGroupsSearch.searchresults}
								{theme}
								{themecolor}
								{telemetry}
								rowclick={(value, index) => {
									handleClickDirectoryGroup(value)
								}}
								view={directoryGroupsSearch.view}
							></ViewDirectoryGroupData>
						{/await}
					{:else}
						<span class="text-center text-sm">Groups you can navigate to will appear here once you have a role in one of them.</span>
					{/if}
				{/await}
			{/if}
		{:else}
			<section class="join max-sm:join-vertical">
				{#if loginEndpoint}
					<a
						class="join-item btn btn-lg flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'}"
						href={loginEndpoint}
					>
						login
					</a>
				{/if}
				{#if registrationEndpoint}
					<a
						class="join-item btn btn-lg flex-1 {themecolor === Domain.Entities.Theme.Color.ACCENT
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-secondary'
								: 'btn-accent'}"
						href={registrationEndpoint}
					>
						register
					</a>
				{/if}
			</section>
		{/if}
	</main>
</div>
