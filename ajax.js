var result;

$(document).ready(function(e){
	google.charts.load('current', {'packages':['corechart']});
	enableCollapsing();
	
	//ResizeTrigger
	$(window).resize(function() {
		if(this.resizeTO) clearTimeout(this.resizeTO);
		this.resizeTO = setTimeout(function() {
			$(this).trigger('resizeEnd');
		}, 500);
	});
	
	$(window).on('resizeEnd', function() {
		drawChart_frequencySpeed(JSON.parse(JSON.stringify(result)));
		drawChart_frequencyTime(JSON.parse(JSON.stringify(result)));
		drawChart_amendePie(JSON.parse(JSON.stringify(result)));
	});
	
	var today = moment().format('YYYY-MM-DD');
	$('#firstDate').val(today);
	$('#lastDate').val(today);
	
	setInterval(function() {
		hideEverything();
		requestData();
	}, 60 * 1000);
	
	$('form').on('submit', function(e){
		e.preventDefault();
		hideEverything();
		requestData();
	});
	
	google.charts.setOnLoadCallback(requestData);
});

function hideEverything(){
	$('.loading').show();
	$('.loaded').hide();
	
	$('#totalCarNumber').html("-");
	$('#overSpeedCar').html("-");
	$('#totalMoney').html("-");
}

function enableCollapsing(){
	$('#collapseDiv1').on('shown.bs.collapse', function () {
		$("#glyphiconCollapse1").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
		drawChart_frequencySpeed(JSON.parse(JSON.stringify(result)));
		drawChart_frequencyTime(JSON.parse(JSON.stringify(result)));
	});

	$('#collapseDiv1').on('hidden.bs.collapse', function () {
		$("#glyphiconCollapse1").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
	});
	
	$('#collapseDiv2').on('shown.bs.collapse', function () {
		$("#glyphiconCollapse2").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
		drawChart_amendePie(JSON.parse(JSON.stringify(result)));
	});

	$('#collapseDiv2').on('hidden.bs.collapse', function () {
		$("#glyphiconCollapse2").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
	});
	
	$('#collapseDiv3').on('shown.bs.collapse', function () {
		$("#glyphiconCollapse3").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
		drawChart_amendePie(JSON.parse(JSON.stringify(result)));
	});

	$('#collapseDiv3').on('hidden.bs.collapse', function () {
		$("#glyphiconCollapse3").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
	});
}

function requestData(){
	$.ajax({
		type: "POST",
		url: "https://adriencouplet.be/dateselect.php",
		data: { 'd1' : $("#firstDate").val(), 'd2' : $("#lastDate").val() },
		dataType: "json",
		success: function(data) {
			result = data;
			calculateDataTable(data);
			drawChart_frequencySpeed(JSON.parse(JSON.stringify(data)));
			drawChart_frequencyTime(JSON.parse(JSON.stringify(data)));
			drawChart_amendePie(JSON.parse(JSON.stringify(data)));
			calculateStats(JSON.parse(JSON.stringify(data)));
		}
	});
}

function calculateDataTable(data){
	$("#bodyDataTable").empty();
	for (i = 1; i <= 5 && i <= data.length; i++){
		var datetime = data[data.length-i][0];
		var speed = data[data.length-i][1];
		$("#bodyDataTable").append("<tr><td>" + moment(datetime).format('DD-MM-YYYY HH:mm:ss') + "</td><td>" + speed.toFixed(2) + " km/h</td><td>" + (speed-6.0).toFixed(2) + " km/h</td></tr>");
	}
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
                max:100,
			},
		},
		vAxis: {
			title: 'Nombre de voitures',
		},
	};

	var chart = new google.visualization.Histogram(document.getElementById('frequencySpeed'));
	$('.loading').hide();
	$('.loaded').show();
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
			1: {title: 'Vitesse moyenne', viewWindow: {min: 50} }
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
	chart.draw(chartData, options);
	
	
}

function drawChart_amendePie(data){
	var amendePie = new Array(5);
	amendePie[0] = ['Degré','Nombre'];
	amendePie[1] = ['Aucun excès',0];
	amendePie[2] = ['Excès de 1 à 10 km/h',0];
	amendePie[3] = ['Excès de 11 à 30 km/h',0]; 
	amendePie[4] = ['Excès de plus de 30 km/h',0];
	for (i = 1; i < data.length; i++){
		var s = data[i][1] - 6.0;
		if (s < 50.0){ amendePie[1][1] = amendePie[1][1]+1; }
		else if (s >= 50.0 && s < 60.0){ amendePie[2][1] = amendePie[2][1]+1; }
		else if (s >= 60.0 && s < 80.0){ amendePie[3][1] = amendePie[3][1]+1; }
		else { amendePie[4][1] = amendePie[4][1]+1; }
	}
	var chartData = google.visualization.arrayToDataTable(amendePie);
			
	var options = {
		title: 'Répartitions des excès de vitesse (vitesse corrigée)',
	};

	var chart = new google.visualization.PieChart(document.getElementById('amendePie'));
	chart.draw(chartData, options);
	
}

function calculateStats(data){
	var totalCarNumber = data.length-1;
	var overSpeedCar = 0;
	var totalMoney = 0;
	
	for (i = 1; i < data.length; i++){
		var s = data[i][1] - 6.0;
		if (s < 50.0){}
		else if (s >= 50.0 && s < 60.0){ 
				overSpeedCar++;
				totalMoney += 50;
		}
		else if (s >= 60.0 && s < 80.0){ 
			overSpeedCar++;
			totalMoney += (50 + (Math.floor(s-60)*10));
		}
		else { 
			overSpeedCar++;
		}
	}
	
	$('#totalCarNumber').html(totalCarNumber);
	$('#overSpeedCar').html(overSpeedCar);
	$('#totalMoney').html(totalMoney + " €");
	
}
