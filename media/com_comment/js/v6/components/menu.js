// define the item component
Vue.component('ccomment-menu', {
	template: '#ccomment-menu',
	data: function() {
		return {
			pagination: this.$store.state.pagination,
		}
	},

	methods: {
		newComment: function() {
			bus.$emit('newComment');
		}
	}
});