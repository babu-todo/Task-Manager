async function login(){
 const username=document.getElementById("username").value;
 const password=document.getElementById("password").value;

 const res=await fetch("/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username,password})
 });

 const data=await res.json();

 if(data.success){
  localStorage.setItem("user",username);
  window.location="dashboard.html";
 }else{
  alert("Invalid login");
 }
}