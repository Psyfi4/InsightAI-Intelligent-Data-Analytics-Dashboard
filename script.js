function analyzeData(){

const fileInput = document.getElementById("fileInput");
const insights = document.getElementById("insights");

if(!fileInput.files.length){
alert("Please upload a CSV file");
return;
}

const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = function(e){

const text = e.target.result;
const rows = text.split("\n").slice(1);

let months=[];
let sales=[];
let profit=[];
let regionSales={};

rows.forEach(row=>{

const cols=row.split(",");

if(cols.length>=4){

const month=cols[0];
const region=cols[1];
const sale=Number(cols[2]);
const prof=Number(cols[3]);

months.push(month);
sales.push(sale);
profit.push(prof);

if(!regionSales[region]) regionSales[region]=0;
regionSales[region]+=sale;

}

});

drawChart(months,sales);

// KPI calculations

const totalSales=sales.reduce((a,b)=>a+b,0);
const avgSales=(totalSales/sales.length).toFixed(2);
const totalProfit=profit.reduce((a,b)=>a+b,0);

let bestRegion = Object.keys(regionSales).reduce((a,b)=>
regionSales[a] > regionSales[b] ? a : b
);

// Update KPI cards

document.getElementById("totalSales").innerText = totalSales;
document.getElementById("totalProfit").innerText = totalProfit;
document.getElementById("avgSales").innerText = avgSales;
document.getElementById("bestRegion").innerText = bestRegion;

// AI-style insights

const maxSales=Math.max(...sales);

insights.innerHTML=`

<p><strong>Total Sales:</strong> ${totalSales}</p>
<p><strong>Average Sales:</strong> ${avgSales}</p>
<p><strong>Highest Sales:</strong> ${maxSales}</p>
<p><strong>Best Region:</strong> ${bestRegion}</p>

`;

};

reader.readAsText(file);

}

function drawChart(months,sales){

const ctx=document.getElementById("chart").getContext("2d");

new Chart(ctx,{
type:"line",
data:{
labels:months,
datasets:[{
label:"Sales Trend",
data:sales,
borderWidth:3,
tension:0.3
}]
},
options:{
responsive:true
}
});

}