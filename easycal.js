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

			self.momStartDate = moment(this.options.startDate, 'DD-MM-YYYY');
			self.momMinTime = moment(this.options.minTime, 'HH:mm:ss');
			self.momMaxTime = moment(this.options.maxTime, 'HH:mm:ss');

			self.launch();
			
			self.$elem.find('.ec-slot').on('click', function(){
				self.options.dayClick.apply(self);
			});

		},

		launch : function(){
			this.display();
			this.showEvents();
		},

		refresh : function(){

		},

		mapEventsByDate : function(){
			var res = {};
			var events = this.options.events;
			var date = this.momStartDate.clone().isoWeekday(1);
			
			for(var i = 0 ; i < 7 ; i++){
				var dateStr = date.format('DD-MM-YYYY');
				var filteredEvents = _.filter(events, function(event){
					if((moment(event.start, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY')) === dateStr){
						return true;
					}
				});
				res[dateStr] = filteredEvents;
				date.add(1, 'd');
			}
			return res;
		},

		showEvents : function(){
			var self = this;
			var events = this.options.events;
			var $cols = this.$elem.find('table td.ec-slot-col');

			var eventDateMap = this.mapEventsByDate();

			var $col = null, $slots, schedule, slotTime;
			_.each($cols, function(col, i){
				$col = $(col); 
				var colDate = $col.attr('data-date');
				var dayEvents = eventDateMap[colDate];
				
				if(dayEvents.length){
					schedule = self.getDaySchedule(dayEvents);
					console.log('Schedule for date : ' + colDate);
					console.log(schedule);

					$slots = $col.find('.ec-slot');
					_.each($slots, function(slot, i){
						slotTime = $(slot).attr('data-time');
						var scheduleForSlot = schedule[slotTime];
						if(scheduleForSlot.length > 1){
							$(slot).css({
								'background-color' : '#ABC',
								color : '#000'
							})
								.html('<div>Multiple</div>');
						}else if(scheduleForSlot.length){
							$(slot).css({
								'background-color' : scheduleForSlot[0].backgroundColor,
								color : scheduleForSlot[0].textColor
							});
							var slotStartTime = moment(colDate + ' ' + slotTime, 'DD-MM-YYYY HH:mm:ss');
							var eventStartTime = moment(scheduleForSlot[0].start, 'DD-MM-YYYY HH:mm:ss');
							if(slotStartTime.isSame(eventStartTime)){
								$(slot).html('<div>' + scheduleForSlot[0].title + '</div>');
							}else{
								$(slot).css({
									'border-top' : '1px solid ' + scheduleForSlot[0].backgroundColor
								});
							}
						}
					});
				}
			});
		},

		getDaySchedule : function(dayEvents){
			var date = moment(dayEvents[0].start, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY');
			var minTime = moment(date + ' ' + this.options.minTime, 'DD-MM-YYYY HH:mm:ss');
			var maxTime = moment(date + ' ' + this.options.maxTime, 'DD-MM-YYYY HH:mm:ss');
			var time = minTime.clone();

			var schedule = {};

			var begining = null, end = null;
			for(;time.isBefore(maxTime);){
				begining = time.clone();
				end = begining.clone().add(15, 'm');

				var slotEvents = _.filter(dayEvents, function(event){
					
					var eventStart = moment(event.start, 'DD-MM-YYYY HH:mm:ss');
					var eventEnd = moment(event.end, 'DD-MM-YYYY HH:mm:ss');

					if(eventStart.isBefore(end) && eventEnd.isAfter(begining)){
						return true;
					}
				});

				schedule[time.format('HH:mm:ss')] = slotEvents;
				time.add(15,'m'); //this.options.slotDuration
			}
			return schedule;
		},

		renderHTML : function(){
			return '<table border="0" cellpadding="0" cellspacing="0" class="easycal">' +
						'<thead>' +
							'<tr>' +
								'<td>' +
									(this.renderHeadHTML()) +
								'</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									(this.renderTimeGridHTML()) +
								'</td>' +
							'</tr>' +
						'</tobdy' +
				'</table>';
		},

		renderHeadHTML : function(){
			var date = moment(this.options.startDate, 'DD-MM-YYYY');
			date.isoWeekday(1);

			var html = '<table border="0" cellspacing="0" cellpadding="0" class="ec-head-table"><tbody><tr>';
			for(var i = 0 ; i < 8 ; i++){
				var cellContent = '';
				if(i !== 0){
					cellContent = date.format(this.options.columnDateFormat);
					html += '<td class="ec-day-header">' + cellContent + '</td>';
					date.add(1, 'd');
				}else{
					html += '<td></td>';
				}
			}
			return html + '</tr></tbody></table>';
		},

		renderTimeGridHTML : function(){
			var minTime = this.momMinTime;
			var maxTime = this.momMaxTime;
			var time = minTime.clone();

			var date = moment(this.options.startDate, 'DD-MM-YYYY');
			date.isoWeekday(1);
			
			var html = '<table border="0" cellspacing="0" cellpadding="0" class="ec-time-grid-table"><tbody><tr>';

			var cellContent = null, timeTag = null, colDate = null;

			for(var i = 0 ; i < 8 ; i++){
				if(i===0){
					html += '<td>';
				}else{
					colDate = date.format('DD-MM-YYYY');
					html += '<td class="ec-slot-col" data-date="' + colDate + '">';
					date.add(1, 'd');
				}

				for(;time.isBefore(maxTime);){
					if(i === 0){
						cellContent = time.format(this.options.timeFormat);
						html += '<div class="table-cell ' + this.options.widgetTimeClass + '">' + cellContent + '</div>';
					}else{
						timeTag = time.format('HH:mm:ss');
						html += '<div class="table-cell ' + this.options.widgetSlotClass + '" data-time="' + timeTag + '"></div>';
					}
					time.add(this.options.slotDuration,'m');
				}

				html += '</td>';
				time = minTime.clone();
			}

			return html + '</tr></tbody></table>';
		},

		display : function(){
			var html = this.renderHTML();
			this.$elem.html(this.renderHTML());
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
		dayClick : null,
		eventClick : null,
		events : [],

		widgetHeaderClass : 'ec-day-header',
		widgetSlotClass : 'ec-slot',
		widgetTimeClass : 'ec-time'
	};

})(jQuery, window, document, _);