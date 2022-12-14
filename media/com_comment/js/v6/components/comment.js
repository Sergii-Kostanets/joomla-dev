// define the item component
Vue.component('ccomment-comment', {
	template: '#ccomment-template',
	props: {
		model: Object
	},
	data: function () {
		return {
			open: false,
			reply: false
		}
	},

	mounted: function() {
		if(this.model.galleria) {
			Galleria.run(jQuery(this.$el).find('.js-ccomment-galleria'), {
				dataSource: this.model.galleria
			});
		}
	},
	updated: function() {
		if(this.model.galleria) {
			Galleria.run(jQuery(this.$el).find('.js-ccomment-galleria'), {
				dataSource: this.model.galleria
			});
		}
	},

	computed: {
		hasChildren: function () {
			return this.model.children &&
				this.model.children.length
		},
		showReply: function() {
			// When posting a new comment, the model has a level of 0, but at the same time if
			// the comment is a child of a parent that is not really possible, so return false just in case
			if(this.model.level === 0 && this.model.parentid !== -1) {
				return false;
			}
			return this.$store.state.config.tree_depth > this.model.level;
		}
	},
	methods: {
		getChild: function () {
			var self = this;

			if (this.model.children && this.model.children.length) {
				var comments = this.model.children.map(function (id) {
					return self.$store.state.commentsById[id];
				});

				return comments;
			}

			return [];
		},

		changeState: function(state, id) {
			var self = this;
			var config = this.$store.state.config;
			var url = config.baseUrl + '?option=com_comment&task=comment.changestate&id='
				+ id + '&format=json&' + this.$store.state.token + '=1'+'&state='+state + '&lang=' + config.langCode;

			jQuery.ajax(url, {
				type: 'get'
			}).done(function(response) {
				if (response.status === 'success') {
					if (state === -1) {
						self.$store.commit('removeComment', id);
					} else {
						self.$store.commit('updateComment', {
							'id' : id,
							'published' : state
						});
					}
				}
			});
		},

		vote: function(vote, id) {
			var self = this;
			var config = this.$store.state.config;
			var url = config.baseUrl + '?option=com_comment&task=comment.vote&vote=' + vote + '&id=' + id
				+ '&format=json&' + this.$store.state.token + '=1'  + '&lang=' + config.langCode;

			jQuery.ajax(url, {
				type: 'get',
				dataType: 'json'
			}).done(function(response) {
				self.$store.commit('updateComment', {
					'id' : id,
					'votes' : response.votes
				});
			});
		},

		edit: function(id) {
			var self = this;
			var config = this.$store.state.config;
			var url = config.baseUrl + '?option=com_comment&task=comment.edit&format=json&id=' + id + '&'
				+ this.$store.state.token + '=1&component=' + this.$store.state.itemConfig.component + '&lang=' + config.langCode

			jQuery.ajax(url, {
				method: 'GET',
				dataType: 'json'
			})
				.done(function (comment) {
					if (comment != undefined) {
						self.$store.dispatch('editComment', comment);
					}
				})
		},

		quote: function(id) {
			var self = this;
			var config = this.$store.state.config;
			var url = config.baseUrl + '?option=com_comment&task=comment.quote&format=json&id=' + id + '&lang=' + config.langCode;

			jQuery.ajax(url, {
				method: 'GET',
				dataType: 'json'
			})
				.done(function (comment) {
					self.$store.commit('quoteComment', comment);
				})

		}
	}
});
