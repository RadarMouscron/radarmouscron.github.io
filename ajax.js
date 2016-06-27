$(document).ready(function(e){
	google.charts.load('current', {'packages':['corechart']});
	
	var today = moment().format('YYYY-MM-DD');
	$('#firstDate').val(today);
	$('#lastDate').val(today);
	
	$('form').on('submit', function(e){
		e.preventDefault();
		$("#frequencySpeed").addClass('loader');
		$("#frequencyTime").addClass('loader');
		requestData();
	});
	
	google.charts.setOnLoadCallback(requestData);
});

function requestData(){
	$.ajax({
		type: "POST",
		url: "https://adriencouplet.be/dateselect.php",
		data: { 'd1' : $("#firstDate").val(), 'd2' : $("#lastDate").val() },
		dataType: "json",
		success: function(data) {
			drawChart_frequencySpeed(JSON.parse(JSON.stringify(data)));
			drawChart_frequencyTime(JSON.parse(JSON.stringify(data)));
		}
	});
}

function drawChart_frequencySpeed(data){
	var obj = window.JSON.stringify(data);
	var chartData = google.visualization.arrayToDataTable($.parseJSON(obj));
			
	var options = {
		title: 'Nombre de voiture par tranche de vitesses',
		legend: { position: 'none' },
		histogram: { bucketSize: 5 },
		hAxis: {
			title: 'Vitesse [km/h]',
			viewWindow:{
                min:35,
			},
		},
		vAxis: {
			title: 'Nombre de voitures',
		},
	};

	var chart = new google.visualization.Histogram(document.getElementById('frequencySpeed'));
	$("#frequencySpeed").removeClass('loader');
	chart.draw(chartData, options);
}

function drawChart_frequencyTime(data){
	var frequencyTime = new Array(24);
	for (i = 0; i < frequencyTime.length; i++){
		frequencyTime[i] = [i,0,"",0.0,""];
	}
	for (i = 1; i < data.length; i++){
		var d = new Date(data[i][0]);
		var s = data[i][1];
		frequencyTime[d.getHours()][1] = frequencyTime[d.getHours()][1] + 1;
		frequencyTime[d.getHours()][3] = frequencyTime[d.getHours()][3] + s;
	}
	for (i = 0; i < frequencyTime.length; i++){
		frequencyTime[i][2] = "de " + i.toString() + ":00 à " + i.toString() + ":59\nNombre: " + frequencyTime[i][1].toString();
		frequencyTime[i][3] = frequencyTime[i][3]/frequencyTime[i][1];
		frequencyTime[i][4] = "de " + i.toString() + ":00 à " + i.toString() + ":59\nVitesse moyenne: " + frequencyTime[i][3].toFixed(2) + " km/h";
		
	}
	
	var chartData = new google.visualization.DataTable();
	chartData.addColumn('number', 'Heure');
    chartData.addColumn('number', 'Nombre');
    chartData.addColumn({type: 'string', role: 'tooltip'});
    chartData.addColumn('number', 'Vitesse');
    chartData.addColumn({type: 'string', role: 'tooltip'});
    chartData.addRows(frequencyTime);
			
	var options = {
		title: 'Nombre de voiture par tranche horaire',
		legend: { position: 'none' },
		hAxis: {
			title: 'Heures [h]',
		},
		vAxes: {
			0: {title: 'Nombre de voitures'},
			1: {title: 'Vitesse moyenne', viewWindow:{
                min:0,
			},}
		},
		seriesType: 'bars',
		series: {
			0: {targetAxisIndex:0},
			1: {
				targetAxisIndex:1,
				type: 'line'
			}
		},
	};

	var chart = new google.visualization.ComboChart(document.getElementById('frequencyTime'));
	$("#frequencyTime").removeClass('loader');
	chart.draw(chartData, options);
	
}
