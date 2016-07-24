Soc.calendar="jalali";
Ext.override(Ext.DatePicker, {
    dayNames: Ext.Date.jalali.dayNames,
    format: 'Y-m-d',
    todayText: 'امروز',
    okText: 'ادامه',
    cancelText: 'برگشت',
    todayTip: '{0} (جای خالی)',
    minText: 'این تاریخ پیش از نخستین ناریخ است',
    maxText: 'این تاریخ پس از آخرین تاریخ است',
    disabledDaysText: 'غیرفعال',
    disabledDatesText: 'غیرفعال',
    nextText: 'ماه پسین (مهار+راست)',
    prevText: 'ماه پیشین (مهار+چپ)',
    monthYearText: 'ماه را انتخاب کنید (جابجایی سال با مهار+بالا/پایین)',
    startDay: 6,
	jalali:true
});
Ext.apply(Ext.DatePicker, {
    jalali:false
});
Ext.apply(Ext.picker.Month, {
    jalali:false
});

Ext.override(Ext.form.DateField, {
    format: 'Y-m-d',
    todayText: 'امروز',
    okText: 'ادامه',
    cancelText: 'برگشت',
    todayTip: '{0} (جای خالی)',
    minText: 'باید تاریخ‌های پس از {0} را برگزینید',
    maxText: 'باید تاریخ‌های پیش از {0} را برگزینید',
    invalidText: '{0} تاریخ درستی نیست، باید در قالب «سال/ماه/روز» باشد',
    disabledDaysText: 'غیرفعال',
    disabledDatesText: 'غیرفعال',
    startDay: 6,
	valueToRaw: function(nv) {
		if(nv){
			var month = (nv.getMonth()+1)<10 ? "0"+(nv.getMonth()+1) : (nv.getMonth()+1);
			var day = nv.getDate()<10 ? "0"+nv.getDate() : nv.getDate();
			var year = nv.getFullYear();
			return Date.jalaliConverter.gregorianToJalali([year,month,day]).join('-');
		}
		return null;
	},
    rawToValue: function(rawValue) {
		if(rawValue)
        	return new Date(Date.jalaliConverter.jalaliToGregorian(rawValue.split('-')).join('-')) || rawValue || null;
		return null;
    },
    beforeBlur : function(){
        var me = this,
            v = me.rawToValue(me.getRawValue()),
            focusTask = me.focusTask;

        if (focusTask) {
            focusTask.cancel();
        }

        if (v) {
            me.setValue(v);
        }
    }	
});

Ext.apply(Ext.form.DateField, {
    jalali:false
});


Ext.override(Ext.DatePicker,{
	
beforeRender: function () {
        /*
         * days array for looping through 6 full weeks (6 weeks * 7 days)
         * Note that we explicitly force the size here so the template creates
         * all the appropriate cells.
         */
        var me = this,
            days = new Array(me.numDays),
            today = (!me.jalali)? Ext.Date.format(new Date(), me.format):Ext.Date.jalali.format(new Date(), me.format);

        // If there's a Menu among our ancestors, then add the menu class.
        // This is so that the MenuManager does not see a mousedown in this Component as a document mousedown, outside the Menu
        if (me.up('menu')) {
            me.addCls(Ext.baseCSSPrefix + 'menu');
        }

        me.monthBtn = new Ext.button.Split({
            ownerCt: me,
            ownerLayout: me.getComponentLayout(),
            text: '',
            tooltip: me.monthYearText,
            listeners: {
                click: me.showMonthPicker,
                arrowclick: me.showMonthPicker,
                scope: me
            }
        });

        if (this.showToday) {
            me.todayBtn = new Ext.button.Button({
                ownerCt: me,
                ownerLayout: me.getComponentLayout(),
                text: Ext.String.format(me.todayText, today),
                tooltip: Ext.String.format(me.todayTip, today),
                tooltipType: 'title',
                handler: me.selectToday,
                scope: me
            });
        }

        me.callParent();

        Ext.applyIf(me, {
            renderData: {}
        });
        Ext.apply(me.renderData, {
            dayNames: me.dayNames,
            showToday: me.showToday,
            prevText: me.prevText,
            nextText: me.nextText,
            days: days
        });
    },
    onOkClick: function(picker, value){
        var me = this,
            month = !this.jalali ? value[0] : value[0]+1,
            year = value[1],
            date = !this.jalali ? new Date(year, month, me.getActive().getDate()) : new Date.parseJalali(year+"/"+month+"/"+me.getActive().getJalaliDate());
            var dm=!this.jalali ? date.getMonth() : date.getJalaliMonth()+1;
        if ( dm !== month) {
            // 'fix' the JS rolling date conversion if needed
            date = !this.jalali ? Ext.Date.getLastDateOfMonth(new Date(year, month, 1)) : Ext.Date.jalali.getLastDateOfMonth(new Date.parseJalali(year+"/"+month+"/"+'1'));
        }
        me.update(Ext.Date.clearTime(date));
        me.hideMonthPicker();
    },

    initDisabledDays : function(){
        var me = this,
            dd = me.disabledDates,
            re = '(?:',
            len,
            d, dLen, dI;

        if(!me.disabledDatesRE && dd){
                len = dd.length - 1;

            dLen = dd.length;

            for (d = 0; d < dLen; d++) {
                dI = dd[d];
                if(! me.jalali)
                    re += Ext.isDate(dI) ? '^' + Ext.String.escapeRegex(Ext.Date.dateFormat(dI, me.format)) + '$' : dI;
                else
                    re += Ext.isDate(Ext.Date.jalali.parse(dI)) ? '^' + Ext.String.escapeRegex(Ext.Date.dateFormat(dI, me.format)) + '$' :  '^' + Ext.String.escapeRegex(Ext.Date.dateFormat(Ext.Date.jalali.parse(dI), me.format)) + '$' ;
                
                if (d != len) {
                    re += '|';
                }
            }

            me.disabledDatesRE = new RegExp(re + ')');
        }
    },
createMonthPicker: function(){
        var me = this,
            picker = me.monthPicker;

        if (!picker) {
            me.monthPicker = picker = new Ext.picker.Month({
                renderTo: me.el,
                floating: true,
                shadow: false,
                jalali:this.jalali,
                small: me.showToday === false,
                listeners: {
                    scope: me,
                    cancelclick: me.onCancelClick,
                    okclick: me.onOkClick,
                    yeardblclick: me.onOkClick,
                    monthdblclick: me.onOkClick
                }
            });
            if (!me.disableAnim) {
                // hide the element if we're animating to prevent an initial flicker
                picker.el.setStyle('display', 'none');
            }
            me.on('beforehide', Ext.Function.bind(me.hideMonthPicker, me, [false]));
        }
        return picker;
    },
    fullUpdate: function(date){
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = !this.jalali ? Ext.Date : Ext.Date.jalali,
            i = 0,
            extraDays = 0,
            visible = me.isVisible(),
            sel = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getDaysInMonth(date),
            firstOfMonth = eDate.getFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.add(date, eDate.MONTH, -1),
            longDayFormat = me.longDayFormat,
            prevStart,
            current,
            disableToday,
            tempDate,
            setCellClass,
            html,
            cls,
            formatValue,
            value;
        if (startingPos < 0) {
            startingPos += 7;
        }
        days += startingPos;
        prevStart =  eDate.getDaysInMonth(previousMonth) - startingPos;
        current = !this.jalali ? new Date(previousMonth.getFullYear(), previousMonth.getMonth(), prevStart, me.initHour) : new Date.createJalali(previousMonth.getJalaliFullYear(), previousMonth.getJalaliMonth(), prevStart, me.initHour);

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
                (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
                (ddays && ddays.indexOf(tempDate.getDay()) != -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
                me.todayKeyListener.setDisabled(disableToday);
            }
        }

        setCellClass = function(cell){
            value = +Ext.Date.clearTime(current, true);
            cell.title = eDate.format(current, longDayFormat);
            // store dateValue number as an expando
            cell.firstChild.dateValue = value;
            if(value == today){
                cell.className += ' ' + me.todayCls;
                cell.title = me.todayText;
            }
            if(value == sel){
                cell.className += ' ' + me.selectedCls;
                me.fireEvent('highlightitem', me, cell);
                if (visible && me.floating) {
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(value < min) {
                cell.className = disabledCls;
                cell.title = me.minText;
                return;
            }
            if(value > max) {
                cell.className = disabledCls;
                cell.title = me.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(current.getDay()) != -1){
                    cell.title = ddaysText;
                    cell.className = disabledCls;
                }
            }
            if(ddMatch && format){
                formatValue = eDate.dateFormat(current, format);
                if(ddMatch.test(formatValue)){
                    cell.title = ddText.replace('%0', formatValue);
                    cell.className = disabledCls;
                }
            }
        }
         for(; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart)+'';
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays)+'';
                cls = me.nextCls;
            } else {
                html = (i - startingPos + 1)+'';
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = !this.jalali ? html : Ext.Date.jalali.number2farsi(html);
            cells[i].className = cls;
            current.setDate(current.getDate() + 1);
            setCellClass(cells[i]);
        }
        if(!this.jalali)
            me.monthBtn.setText(Ext.Date.format(date, me.monthYearFormat));
        else 
			me.monthBtn.setText(Ext.Date.jalali.format(date, me.monthYearFormat));
    },
    update : function(date, forceRefresh){
        var me = this,
            active = me.activeDate;
        if (me.rendered) {
            me.activeDate = date;
            var activeMonth= active ? (!this.jalali ? active.getMonth() : active.getJalaliMonth()) : null;
            var dateMonth= !this.jalali ? date.getMonth() : date.getJalaliMonth();
            var activeYear= active ? (!this.jalali ? active.getFullYear() : active.getJalaliFullYear()) : null;
            var dateYear= !this.jalali ? date.getFullYear() : date.getJalaliFullYear();
            if(!forceRefresh && active && me.el && activeMonth == dateMonth && activeYear == dateYear){
//            if(!forceRefresh && active && me.el && active.getMonth() == date.getMonth() && active.getFullYear() == date.getFullYear()){
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
            me.innerEl.dom.title = Ext.String.format(me.ariaTitle, Ext.Date.format(me.activeDate, me.ariaTitleDateFormat));
        }
        return me;
    }
},
function() {
    var proto = this.prototype,
        date = !this.jalali ? Ext.Date: Ext.Date.jalali;

    proto.monthNames = date.monthNames;
    proto.dayNames   = date.dayNames;
    proto.format     = date.defaultFormat;
}
)

Ext.override(Ext.picker.Month,{
    okText: 'تأیید',
    cancelText: 'انصراف',
    initComponent: function(){
        var me = this;

        me.selectedCls = me.baseCls + '-selected';
        if (me.small) {
            me.addCls(me.smallCls);
        }
        me.setValue(me.value);
        me.activeYear = !this.jalali ? me.getYear(new Date().getFullYear() - 4, -4) : me.getYear(new Date().getJalaliFullYear() - 4, -4);

        if (me.showButtons) {
            me.okBtn = new Ext.button.Button({
                text: me.okText,
                handler: me.onOkClick,
                scope: me
            });
            me.cancelBtn = new Ext.button.Button({
                text: me.cancelText,
                handler: me.onCancelClick,
                scope: me
            });
        }

        this.callParent();
    },
    beforeRender: function(){
        var me = this,
            i = 0,
            months = [],
            shortName = !this.jalali ? Ext.Date.getShortMonthName : Ext.Date.jalali.getShortMonthName,
            monthLen = me.monthOffset,
            margin = me.monthMargin,
            style = '';

        me.callParent();

        for (; i < monthLen; ++i) {
            months.push(shortName(i), shortName(i + monthLen));
        }
        
        if (Ext.isDefined(margin)) {
            style = 'margin: 0 ' + margin + 'px;';
        }

        Ext.apply(me.renderData, {
            months: months,
            years: me.getYears(),
            showButtons: me.showButtons,
            monthStyle: style
        });
    },
    updateBody: function(){
        var me = this,
            years = me.years,
            months = me.months,
            yearNumbers = me.getYears(),
            cls = me.selectedCls,
            value = me.getYear(null),
            month = me.value[0],
            monthOffset = me.monthOffset,
            year,
            yearItems, y, yLen, el;
        if (me.rendered) {
            years.removeCls(cls);
            months.removeCls(cls);

            yearItems = years.elements;
            yLen      = yearItems.length;

            for (y = 0; y < yLen; y++) {
                el = Ext.fly(yearItems[y]);

                year = yearNumbers[y];
                el.dom.innerHTML = Ext.Date.jalali.number2farsi(year+'');
                if (year == value) {
                    el.dom.className = cls;
                }
            }
            if (month !== null) {
                if (month < monthOffset) {
                    month = month * 2;
                } else {
                    month = (month - monthOffset) * 2 + 1;
                }
                months.item(month).addCls(cls);
            }
        }
    },
    setValue: function(value){
        var me = this,
            active = me.activeYear,
            offset = me.monthOffset,
            year,
            index;

        if (!value) {
            me.value = [null, null];
        } else if (Ext.isDate(value)) {
            me.value = !this.jalali ? [value.getMonth(), value.getFullYear()] : [value.getJalaliMonth(), value.getJalaliFullYear()];
        } else {
            me.value = [value[0], value[1]];
        }

        if (me.rendered) {
            year = me.value[1];
            if (year !== null) {
                if ((year < active || year > active + me.yearOffset)) {
                    me.activeYear = year - me.yearOffset + 1;
                }
            }
            me.updateBody();
        }

        return me;
    }
})