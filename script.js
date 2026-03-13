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
let regions=[];

rows.forEach(row => {

const cols=row.split(",");

if(cols.length>2){

months.push(cols[0]);
regions.push(cols[1]);
sales.push(Number(cols[2]));

}

});

drawChart(months,sales);

const totalSales=sales.reduce((a,b)=>a+b,0);
const avgSales=(totalSales/sales.length).toFixed(2);
const maxSales=Math.max(...sales);

insights.innerHTML=`

<p><strong>Total Sales:</strong> ${totalSales}</p>
<p><strong>Average Sales:</strong> ${avgSales}</p>
<p><strong>Highest Sales:</strong> ${maxSales}</p>

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