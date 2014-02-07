/*
 * 根据 bootstrap modal.js 改写而来
 * 渐进增强支持ie6
 * 依赖jquery，但不依赖任何样式
 * 只支持data-target，不支持href
 * 暂不支持remote（项目中未用到，且数据格式通常不返回html）
 * 其余用法同 bootstrap modal 
 */
;(function (window, document, $) {
	'use strict';

	var isIE6 = !!$('<div><!--[if IE 6]><span></span><![endif]--></div>').find('span').size();

	var Modal = function (element, options) {
		this.options = options;
		this.$element = $(element);
		this.$backdrop = 
		this.isShown = null;
	};

	Modal.DEFAULTS = {
		backdrop: true,
		keyboard: true,
		show: true
	};

	Modal.prototype.toggle = function () {
		return this[!this.isShown ? 'show' : 'hide']();
	};

	Modal.prototype.show = function () {
		var e = $.Event('show.bs.modal'),
			$el = this.$element;

		$el.trigger(e);

		if (this.isShown || e.isDefaultPrevented()) {
			return ;
		}

		this.isShown = true;
		this.escape();
		$el.on('click.dismiss.modal', '[data-dismiss=modal]', $.proxy(this.hide, this));

		this.createBackdrop();

		if (!$el.parent().length) {
			$el.appendTo(document.body);
		}

		$el.show();
		$el.focus(); // thus is can response keyup event

		e = $.Event('shown.bs.modal');
		$el.trigger(e);	
	};

	Modal.prototype.hide = function (e) {
		// 如果是由用户点击关闭，则需要preventDefault
		if (e) {
			e.preventDefault();
		}

		e = $.Event('hide.bs.modal');

		this.$element.trigger(e);

		if (!this.isShown || e.isDefaultPrevented()) {
			return ;
		}

		this.isShown = false;
		this.escape();
		this.$element.off('click.dismiss.modal');
		this.hideModal();
	};

	Modal.prototype.escape = function () {
		if (this.isShown && this.options.keyboard) {
			$(document).delegate(this.$element, 'keyup.dismiss.bs.modal', $.proxy(function (e) {
				e.which === 27 && this.hide();
			}, this));
		} else if (!this.isShown) {
			$(document).undelegate(this.$element, 'keyup.dismiss.bs.modal');
		}
	};

	Modal.prototype.hideModal = function () {
		this.$element.hide();
		this.removeBackdrop();
		this.$element.trigger('hidden.bs.modal');	
	};

	Modal.prototype.createBackdrop = function () {
		this.$backdrop = $('<div></div>').css({
			position: 'fixed',
			top: 0,
			left: 0,
			zIndex: 999,
			opacity: 0.5,
			width: '100%',
			height: '100%',
			backgroundColor: '#000',
			filter: 'alpha(opacity=50)',
			display: 'none'
		}).appendTo(document.body);

		if (isIE6) {
			this.$backdrop.css({
				position: 'absolute',
				height: $(document).outerHeight()
			})
		}

		this.$backdrop.show();
		this.$backdrop.on('click.dismiss.modal', $.proxy(this.hide, this));
	};

	Modal.prototype.removeBackdrop = function () {
		this.$backdrop && this.$backdrop.remove();
		this.$backdrop = null;
	};

	var old = $.fn.modal;

	$.fn.modal = function (option) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('bs.modal'),
				options = $.extend({}, Modal.DEFAULTS, $this.data(), option);

			if (!data) {
				data = new Modal(this, options);
				$this.data('bs.modal', data);
			}

			if (typeof option === 'string') {
				data[option] && data[option]();
			} else if (options.show) {
				data.show();
			}
		});
	};

	$.fn.modal.Constructor = Modal;

	$.fn.modal.noConflict = function () {
		$.fn.modal = old;
		return this;
	};

	$(document).on('click.bs.modal.data-api', '[data-toggle=modal]', function (e) {
		var $this = $(this),
			$target = $($this.attr('data-target')),
			options = $.extend($target.data(), $this.data());

		e.preventDefault();

		$target.modal(options);
	});

})(window, document, jQuery);