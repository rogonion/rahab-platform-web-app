<script lang="ts">
	import { Domain } from '$lib'
	import Footer from '../Footer/Component.svelte'

	const COMPONENT_NAME = 'intro-poster'
</script>

<div class="flex h-full w-full flex-col gap-y-2 overflow-hidden p-2">
	<header class="flex-[0.5]">
		<h1 class="text-center text-3xl font-bold">RAHAB <span class="text-primary">PLATFORM</span></h1>
	</header>

	<main class="flex flex-[9] justify-center overflow-auto">
		<div class="flex flex-[9.5] justify-center">
			<img src={Domain.Entities.Static.BOT_JPG} class="max-h-full max-w-[60%] self-center" alt="rahab software img01" />
		</div>
	</main>

	<Footer></Footer>
</div>
