// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	devtools: {
		enabled: false
	},
	css: [
		"~/src/css/style.css"
	],
	modules: [
		"nuxt-icon"
	],
	components: ["./components", "./components/buttons"]
	
});