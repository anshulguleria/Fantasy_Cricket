$(document).ready(function(){
	var filterObject = function(){
		this.Value = '';
		this.itemElement = '';
		this.targetElement = '';
		//there is tight binding b/w targetelement and itemelement
		//	i.e. targetelement is supposed to be in b/s item element
		//	remove that dependency
		this.targetProperty ='';
		this.exitEffect = 'fadeOut';
		this.enterEffect = 'show';

	};

	$('.team-filter').on('click', function(){
		var filter = new filterObject();
		filter.Value = $(this).data('team');
		filter.itemElement = 'table.playerList tbody tr';
		filter.targetElement = 'td.team';
		filter.targetProperty = 'data-team';





		filterChange(filter);
	});



	$('#filter_text').on('keyup', function(){
		var filter  = new filterObject();
		
		filter.Value = $(this).val();
		//filter.itemElement = 'ul.playerList > li';
		filter.itemElement = 'table.playerList tbody tr';
		filter.targetElement = 'td.name';
		filter.targetProperty = 'data-name';

		filterChange(filter);
	});
	$('ul > li.player-filters').on('click', function(){
		var filter = new filterObject();
		$('ul > li.player-filters').removeClass('active');
		$(this).addClass('active');

		filter.Value = $(this).data('category');
		filter.itemElement = 'table.playerList tbody tr';
		filter.targetElement = '';
		filter.targetProperty = 'data-category';

		filterChange(filter);
	})

	$(function(){
		$('table.playerList').each(function(index,value){
			$('table.playerList').sortTable({
				onCol: index,
				keepRelationships: true
			});
		});
		
	}());	


	function filterChange(filter){
		//do some calculation since filter is changed
		// var defaultFilter = {
		// 	enterEffect: 'slideDown',
		// 	exitEffect: 'slideUp',
		// 	Value: '',
		// 	targetElement: '',
		// 	targetProperty: '',
		// };

		//filter = $.extend(defaultFilter, filter);

		var count = 0;
		$(filter.itemElement).each(function(){
			//this represents the current selection in loop
			var $selection;
			if(filter.targetElement){
				$selection = $(filter.targetElement, this);
			} else {
				$selection = $(this);
			}
			if($selection.attr(filter.targetProperty).search(new RegExp(filter.Value, 'i')) < 0){
				//$(this).fadeOut();
				//generic way
				$(this)[filter.exitEffect]();
			} else {
				//$(this).show();
				count++;
				$(this)[filter.enterEffect]();
			}
		});

	}


});