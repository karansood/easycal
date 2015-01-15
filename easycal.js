(function($, window, document, _, undefined){

	if( typeof Object.create !== 'function'){
		Object.create = function(obj){
			function F(){};
			F.prototype = obj;
			return new F();
		}
	}

	var Easycal = {
		init : function(options, elem){
			var self = this;
			self.elem = elem;
			self.$elem = $( elem );

			self.options = options;

			self.launch();
			
			self.$elem.find('td').on('click', function(){
				self.options.onSlotClick.apply(self);
			});

		},

		launch : function(){
			
			this.display();
		},

		refresh : function(){

		},

		generateHTML : function(){

			var date = moment(this.options.startDate, 'DD-MM-YYYY');
			
			var minTime = moment(this.options.minTime, 'HH:mm:ss');
			var maxTime = moment(this.options.maxTime, 'HH:mm:ss');

			date.isoWeekday(1);

			var $container = $('<table border="0" cellpadding="0"></table>').addClass('easycal');
			var $content
			var cell = '<th></th>';
			var $header = $('<thead><tr></tr></thead>');
			for(var i = 0 ; i < 8 ; i++){
				var $cell = $(cell);
				var cellContent = '';
				if(i !== 0){
					cellContent = date.format(this.options.columnDateFormat);
					$cell.addClass('ec-day-header');
					date.add(1, 'd');
				}else{
					$cell.css({width: 35});
				}
				$cell.html(cellContent);
				$header.find('tr').append($cell);
			}
			$container.append($header);

			var time = minTime.clone();	

			for(;time.isBefore(maxTime);){
				var $tr = $('<tr class="tr-body"></tr>');
				for(var col = 0 ; col < 8 ; col++){
					var $td = $('<td class="td-body"></td>');
					var cellContent = '';
					if(col === 0){
						cellContent = time.format(this.options.timeFormat);
						time.add(this.options.slotDuration,'m');
						$td.addClass('ec-time');
					}else{
						$td.addClass('ec-content');
					}
					$td.html(cellContent);
					$tr.append($td);
				}
				$container.append($tr);
			}

			return $container;
		},

		display : function(){
			var html = this.generateHTML();
			this.$elem.html(html);
		}

	};

	$.fn.easycal = function(options){

		var mergedOptions = $.extend({}, $.fn.easycal.defaults, options);

		return this.each(function(i, elem){

			var easycal = Object.create(Easycal);
			easycal.init(mergedOptions, this);

			
		});
	};

	$.fn.easycal.defaults = {
		columnDateFormat : 'dddd, DD MMM',
		timeFormat : 'HH:mm',
		minTime : '08:00:00',
		maxTime : '19:00:00',
		slotDuration : 15, //in mins
		onSlotClick : null
	};

})(jQuery, window, document, _);