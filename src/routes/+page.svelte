<script lang="ts">
	import { Domain, Interfaces, State } from '$lib'
	import { getContext } from 'svelte'
	import { Tab } from './util'

	const COMPONENT_NAME = 'home-page'

	let windowWidth: number = $state(0)

	let detailedView: boolean = $state(false)

	let currentTab: Tab = $state(Tab.LOGIN)

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	async function handleSignout() {
		try {
			const fetchResponse = await fetch(Domain.Entities.Url.ApiUrlPaths.Iam.Signout, { credentials: 'include' })
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
				State.Toast.Message = 'Sign out successful'
				State.ResetSession()
				window.location.reload()
			} else {
				throw [fetchResponse.status, fetchData]
			}
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Sign out failed', 'error', e)
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = 'Sign out failed'
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full w-full flex-1 gap-x-2 self-center overflow-hidden p-4">
	<section class="flex flex-1 flex-col justify-center overflow-hidden rounded-lg p-1">
		<div
			class="flex h-fit w-full flex-col gap-y-1 self-center overflow-hidden rounded-lg {State.Theme.value === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-700'
				: 'bg-white'} p-1 shadow-md shadow-gray-800"
		>
			<header class="flex flex-[0.5] justify-between">
				<div class="flex justify-center">
					<img src={Domain.Entities.Static.LOGO_PNG} alt="website logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				</div>
				<section class="flex flex-[9.5] justify-center">
					<div role="tablist" class="tabs tabs-box w-fit">
						<button
							role="tab"
							class="flex-1 tab{currentTab === Tab.LOGIN ? ' tab-active text-primary-content [--tab-bg:var(--color-primary)]' : ''}"
							onclick={() => (currentTab = Tab.LOGIN)}
						>
							Login/Register
						</button>

						<button
							role="tab"
							class="flex-1 tab{currentTab === Tab.ABOUT_US ? ' tab-active btn-primary text-primary-content [--tab-bg:var(--color-primary)]' : ''}"
							onclick={() => (currentTab = Tab.ABOUT_US)}
						>
							About us
						</button>
					</div>
				</section>
				{#if State.Session.session?.iam_credential}
					<button
						class="btn btn-circle btn-ghost btn-md tooltip tooltip-left tooltip-primary self-center"
						onclick={handleSignout}
						data-tip="Sign out"
					>
						<!--mdi:logout source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
								d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"
							/>
						</svg>
					</button>
				{/if}
			</header>

			<main class="flex flex-[9.5] flex-col gap-y-1 overflow-hidden rounded-lg p-2 shadow-inner shadow-gray-800">
				{#if currentTab === Tab.LOGIN}
					{#await import('$lib/components/SignInUp/Component.svelte') then { default: SignInUp }}
						<SignInUp
							theme={State.Theme.value}
							themecolor={State.ThemeColor.value}
							{telemetry}
							session={State.Session.session}
							openidendpoints={State.OpenidEndpoints.value}
						></SignInUp>
					{/await}
				{:else if currentTab === Tab.ABOUT_US}
					<div class="flex flex-col gap-y-1 overflow-auto">
						<div class="text-lg font-bold">objective</div>
						<div class="text-sm">
							Create the most comprehensive, feature-rich, and easy to use platform for managing the daily activities of a business.
						</div>
					</div>
				{/if}
			</main>
		</div>
	</section>

	{#if windowWidth > 1200 && !detailedView}
		<section
			class="flex flex-1 flex-col justify-center overflow-hidden rounded-lg p-1 shadow-md shadow-gray-800 {State.Theme.value ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-700'
				: 'bg-white'}"
		>
			{#await import('$lib/components/Intro/Poster/Component.svelte') then { default: IntroPoster }}
				<IntroPoster></IntroPoster>
			{/await}
		</section>
	{/if}
</div>
