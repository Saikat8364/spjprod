const https = require("https");
const express= require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var fs = require("fs");
const mysql=require("mysql");
const session = require('express-session');
const con = require('./db.js');
const app=express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

function number2text(value) {
    var fraction = Math.round(frac(value)*100);
    var f_text  = "";

    if(fraction > 0) {
        f_text = " And "+convert_number(fraction)+" Paisa";
    }

    return "Rupees "+convert_number(value)+f_text+" Only";
}

function frac(f) {
    return f % 1;
}
function convert_number(number)
{
    if ((number < 0) || (number > 999999999))
    {
        return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);  /* Crore */
    number -= Gn * 10000000;
    var kn = Math.floor(number / 100000);     /* lakhs */
    number -= kn * 100000;
    var Hn = Math.floor(number / 1000);      /* thousand */
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100);       /* Tens (deca) */
    number = number % 100;               /* Ones */
    var tn= Math.floor(number / 10);
    var one=Math.floor(number % 10);
    var res = "";

    if (Gn>0)
    {
        res += (convert_number(Gn) + " Crore");
    }
    if (kn>0)
    {
            res += (((res=="") ? "" : " ") +
            convert_number(kn) + " Lakh");
    }
    if (Hn>0)
    {
        res += (((res=="") ? "" : " ") +
            convert_number(Hn) + " Thousand");
    }

    if (Dn)
    {
        res += (((res=="") ? "" : " ") +
            convert_number(Dn) + " Hundred");
    }


    var ones = Array("", "One", "Two", "Three", "Four", "Five", "Six","Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen","Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen","Nineteen");
var tens = Array("", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty","Seventy", "Eighty", "Ninety");

    if (tn>0 || one>0)
    {
        if (!(res==""))
        {
            res += " And ";
        }
        if (tn < 2)
        {
            res += ones[tn * 10 + one];
        }
        else
        {

            res += tens[tn];
            if (one>0)
            {
                res += ("-" + ones[one]);
            }
        }
    }

    if (res=="")
    {
        res = "zero";
    }
    return res;
}

app.get("/", function(req,res){
    res.render("index");
});

app.get("/gallery", function(req,res){
    res.render("gallery");
});

app.get("/login",function(req,res){
    res.render("login",{message:undefined});
});
app.get("/loginf",function(req,res){
    res.render("login",{message:"Please use Valid Credentials"});
});

app.post("/login", function(req,res){
    var sql = "select * from  users where uname ='"+req.body.uname+"' and pass = '"+req.body.pass+"';";
    con.query(sql, function(err,result){
        if (err) throw err;
        if (result.length >0){
            req.session.loggedin=true;
            req.session.username=result[0].uname;
            res.redirect("/home");
        }else{
            res.redirect("/loginf");
        }
    });
});

app.get("/home", function (req,res){
    if(req.session.loggedin){
        res.render("homepage",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/admin", function (req,res){
    if(req.session.loggedin){
        res.render("admin",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/utility", function (req,res){
    if(req.session.loggedin){
        res.render("utility",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/clients", function (req,res){
    if(req.session.loggedin){
        res.render("clients",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/addclient", function (req,res){
    if(req.session.loggedin){
        res.render("addclient",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/modclient", function (req,res){
    if(req.session.loggedin){
        var sql = "select clientsid,cname from clients;";
            con.query(sql, function(err, result){
            if (err) throw err;
            res.render("modclient",{result:result,un:req.session.username});
        });
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/invoice", function (req,res){
    if(req.session.loggedin){
        res.render("invoice",{un:req.session.username});
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/newinv", function (req,res){
    if(req.session.loggedin){
        var sql = "select clientsid,cname from clients;";
            con.query(sql, function(err, result){
            if (err) throw err;
            res.render("newinv",{result:result,un:req.session.username});
        });
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});
app.get("/editinv", function (req,res){
    if(req.session.loggedin){
        var sql = "select rid,cname from records order by rid desc;";
            con.query(sql, function(err, result){
            if (err) throw err;
            res.render("editinv",{result:result,un:req.session.username});
        });
    }else{
        res.render("login",{message:"Please Login to Continue"});
    }
});


app.post("/addclient", function(req,res){
    var sql = "INSERT INTO `clients` (`cname`, `caddress`, `cgstin`, `crate`, `creprate`, `cgst_type`) VALUES ('"+req.body.cname+"', '"+req.body.caddr+"', '"+req.body.cgstin+"', '"+req.body.crate+"', '"+req.body.creprate+"', '"+req.body.cgsttype+"');";
    con.query(sql, function(err,result){
        if (err) throw err;
        res.render("clientspost",{message:"Client Added Successfully",un:req.session.username});
    });
});
app.post("/chooseclient", function (req,res){
    var c_id = req.body.client;
    var sql = "select * from clients where clientsid = '"+c_id+"';";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.render("editclientdetails",{result:result,un:req.session.username});
    });
});
app.post("/postmodclient", function (req,res){
    var sql = "UPDATE `clients` SET `cname` = '"+req.body.cname+"',`caddress`='"+req.body.caddr+"',`cgstin` = '"+req.body.cgstin+"', `crate` = '"+req.body.crate+"', `creprate` = '"+req.body.creprate+"', `cgst_type` = '"+req.body.cgsttype+"'  WHERE (`clientsid` = '"+req.body.cid+"');";
    con.query(sql, function(err,result){
        if (err) throw err;
        res.render("clientspost",{message:"Client Modified Successfully",un:req.session.username});
    });
});
app.post("/chooseclientinv", function(req,res){
    var c_id = req.body.client;
    var sql = "select * from clients where clientsid = '"+c_id+"';";
    con.query(sql, function(err, result){
        if (err) throw err;
        var sql2 = "select * from records order by rid desc limit 1;"
        con.query(sql2, function(err, items){
            if (err) throw err;
            var id = parseInt(items[0].rid)+1;
            res.render("invdetails",{result:result,i:id,un:req.session.username});
        });
    });
});
app.post("/invdetailssubmit",function(req,res){
    var rate = 0.00;
    var crate = req.body.crate;
    rate = parseFloat(crate).toFixed(2);
    var reprate = 0.00;
    var creprate = req.body.creprate;
    reprate = parseFloat(creprate).toFixed(2);
    var gorn = 0.000;
    gorn = parseFloat(req.body.gorn).toFixed(3);
    if(isNaN(gorn)){
        gorn = 0.000;
    };
    var rep = 0.000;
    rep = parseFloat(req.body.rep).toFixed(3);
    if(isNaN(rep)){
        rep = 0.000;
    };
    var totwt = 0.000;
    totwt = parseFloat(parseFloat(gorn)+parseFloat(rep)).toFixed(3);
    var mval = 0.00;
    mval = parseFloat(rate*gorn).toFixed(2);
    var rval = 0.00;
    rval = parseFloat(reprate*rep).toFixed(2);
    var m_igst = 0.00;
    var m_sgst = 0.00;
    var m_cgst = 0.00;
    var m_total = 0.00;
    var r_igst = 0.00;
    var r_sgst = 0.00;
    var r_cgst = 0.00;
    var r_total = 0.00;
    var net_total = 0.00;
    if(req.body.cgsttype=='igst'){
        m_igst = parseFloat(mval*0.05).toFixed(2);
        r_igst = parseFloat(rval*0.05).toFixed(2);
        m_total = parseFloat(parseFloat(mval)+parseFloat(m_igst)).toFixed(2);
        r_total = parseFloat(parseFloat(rval)+parseFloat(r_igst)).toFixed(2);
        net_total = parseFloat(m_total)+parseFloat(r_total);
        net_total = parseFloat(net_total.toFixed(2)).toFixed(2);
    }else{
        m_sgst = parseFloat(mval*0.025).toFixed(2);
        m_cgst = parseFloat(mval*0.025).toFixed(2);
        m_total = parseFloat(parseFloat(mval)+parseFloat(m_sgst)+parseFloat(m_cgst)).toFixed(2);
        r_sgst = parseFloat(rval*0.025).toFixed(2);
        r_cgst = parseFloat(rval*0.025).toFixed(2);
        r_total = parseFloat(parseFloat(rval)+parseFloat(r_sgst)+parseFloat(r_cgst)).toFixed(2);
        net_total = parseFloat(m_total)+parseFloat(r_total);
        net_total = parseFloat(net_total.toFixed(2));
        net_total = parseFloat(net_total.toFixed(2)).toFixed(2);
    }
    var in_words_rate = number2text(net_total);
    var mrate = parseFloat(req.body.mrate);
    var mcost = mrate*totwt;
    var in_words_price = number2text(mcost);
    mcost = mcost.toFixed(2);
    // var date=new Date().toLocaleDateString("en-GB");
    var date=new Date();
	date=date.toISOString().slice(0,10);
    var sql = "INSERT INTO `records` (`date`, `invtype`, `cid`, `cname`, `caddr`, `cgstin`, `cgsttype`, `crate`, `creprate`, `ivno`, `ivdate`, `gorn`, `rep`, `totwt`, `mval`, `m_igst`, `m_sgst`, `m_cgst`, `m_total`, `rval`, `r_igst`, `r_sgst`, `r_cgst`, `r_total`, `net_total`, `in_words_rate`, `mrate`, `mcost`, `in_words_price`) VALUES ('"+date+"', '"+req.body.invtype+"', '"+req.body.cid+"', '"+req.body.cname+"', '"+req.body.caddr+"', '"+req.body.cgstin+"', '"+req.body.cgsttype+"', '"+parseFloat(req.body.crate).toFixed(2)+"', '"+parseFloat(req.body.creprate).toFixed(2)+"', '"+req.body.ivno+"', '"+req.body.ivdate+"', '"+req.body.gorn+"', '"+req.body.rep+"', '"+totwt+"', '"+mval+"', '"+m_igst+"', '"+m_sgst+"', '"+m_cgst+"', '"+m_total+"', '"+rval+"', '"+r_igst+"', '"+r_sgst+"', '"+r_cgst+"', '"+r_total+"', '"+net_total+"', '"+in_words_rate+"', '"+req.body.mrate+"', '"+mcost+"', '"+in_words_price+"');";
    con.query(sql, function(err, result){
        if (err) throw "Error";
    });
    var sql2 = "select * from records order by rid desc limit 1;";
    con.query(sql2, function(err, result){
        if (err) throw err;
        var d= result[0].date;
        d=d.toLocaleDateString("en-GB");
        res.render("outputinv",{r:result,date:d,un:req.session.username});
    });
});
app.post("/invdetailseditsubmit",function(req,res){
    var rate = 0.00;
    var crate = req.body.crate;
    rate = parseFloat(crate).toFixed(2);
    var reprate = 0.00;
    var creprate = req.body.creprate;
    reprate = parseFloat(creprate).toFixed(2);
    var gorn = 0.000;
    gorn = parseFloat(req.body.gorn).toFixed(3);
    if(isNaN(gorn)){
        gorn = 0.000;
    };
    var rep = 0.000;
    rep = parseFloat(req.body.rep).toFixed(3);
    if(isNaN(rep)){
        rep = 0.000;
    };
    var totwt = 0.000;
    totwt = parseFloat(parseFloat(gorn)+parseFloat(rep)).toFixed(3);
    var mval = 0.00;
    mval = parseFloat(rate*gorn).toFixed(2);
    var rval = 0.00;
    rval = parseFloat(reprate*rep).toFixed(2);
    var m_igst = 0.00;
    var m_sgst = 0.00;
    var m_cgst = 0.00;
    var m_total = 0.00;
    var r_igst = 0.00;
    var r_sgst = 0.00;
    var r_cgst = 0.00;
    var r_total = 0.00;
    var net_total = 0.00;
    if(req.body.cgsttype=='igst'){
        m_igst = parseFloat(mval*0.05).toFixed(2);
        r_igst = parseFloat(rval*0.05).toFixed(2);
        m_total = parseFloat(parseFloat(mval)+parseFloat(m_igst)).toFixed(2);
        r_total = parseFloat(parseFloat(rval)+parseFloat(r_igst)).toFixed(2);
        net_total = parseFloat(m_total)+parseFloat(r_total);
        net_total = parseFloat(net_total.toFixed(2));
        net_total = parseFloat(net_total.toFixed(2)).toFixed(2);
    }else{
        m_sgst = parseFloat(mval*0.025).toFixed(2);
        m_cgst = parseFloat(mval*0.025).toFixed(2);
        m_total = parseFloat(parseFloat(mval)+parseFloat(m_sgst)+parseFloat(m_cgst)).toFixed(2);
        r_sgst = parseFloat(rval*0.025).toFixed(2);
        r_cgst = parseFloat(rval*0.025).toFixed(2);
        r_total = parseFloat(parseFloat(rval)+parseFloat(r_sgst)+parseFloat(r_cgst)).toFixed(2);
        net_total = parseFloat(m_total)+parseFloat(r_total);
        net_total = parseFloat(net_total.toFixed(2));
        net_total = parseFloat(net_total.toFixed(2)).toFixed(2);
    }
    var in_words_rate = number2text(net_total);
    var mrate = parseFloat(req.body.mrate);
    var mcost = mrate*totwt;
    var in_words_price = number2text(mcost);
    mcost = mcost.toFixed(2);
    // var date=new Date().toLocaleDateString("en-GB");
    var date=new Date();
	date=date.toISOString().slice(0,10);
    var sql = "UPDATE `records` SET `date`='"+date+"',`invtype`='"+req.body.invtype+"',`cid`='"+req.body.cid+"',`cname`='"+req.body.cname+"',`caddr`='"+req.body.caddr+"',`cgstin`='"+req.body.cgstin+"',`cgsttype`='"+req.body.cgsttype+"',`crate`='"+parseFloat(req.body.crate).toFixed(2)+"',`creprate`='"+parseFloat(req.body.creprate).toFixed(2)+"',`ivno`='"+req.body.ivno+"',`ivdate`='"+req.body.ivdate+"',`gorn`='"+req.body.gorn+"',`rep`='"+req.body.rep+"', `totwt`='"+totwt+"', `mval`='"+mval+"', `m_igst`='"+m_igst+"', `m_sgst`='"+m_sgst+"', `m_cgst`='"+m_cgst+"',`m_total`='"+m_total+"',`rval`='"+rval+"',`r_igst`='"+r_igst+"',`r_sgst`='"+r_sgst+"',`r_cgst`='"+r_cgst+"',`r_total`='"+r_total+"',`net_total`='"+net_total+"',`in_words_rate`='"+in_words_rate+"',`mrate`='"+req.body.mrate+"',`mcost`='"+mcost+"',`in_words_price`='"+in_words_price+"' WHERE (`rid` = '"+req.body.rid+"');";
    con.query(sql, function(err, result){
        if (err) throw "Error";
    });
    var sql2 = "select * from records WHERE (`rid` = '"+req.body.rid+"');";
    con.query(sql2, function(err, result){
        if (err) throw err;
        var d= result[0].date;
        d=d.toLocaleDateString("en-GB");
        res.render("outputinv",{r:result,date:d,un:req.session.username});
    });
});
app.post("/editinvdetails", function(req,res){
    var sql = "select * from records where rid = "+req.body.billno+";";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.render("editinvdetails",{r:result,un:req.session.username});
    });
});

app.post("/invop",function(req,res){
    if(req.body.invop=='bd'){
        res.render("invop_bd",{un:req.session.username});
    }
    if(req.body.invop=='bdr'){
        res.render("invop_bdr",{un:req.session.username});
    }
    if(req.body.invop=='bc'){
        var sql = "select clientsid,cname from clients;"
        con.query(sql, function(err, result){
            if (err) throw err;
            res.render("invop_bc",{r:result,un:req.session.username});
        });
    }
});

app.post("/invop_bd", function(req,res){
    var dt = (req.body.inpdt);
    var date=new Date(dt);
    date=date.toISOString().slice(0,10);
    var sql = "select * from records where date ='"+date+"';";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.render("invoicelist",{r:result,hd:req.body.hd,un:req.session.username});
    });
});
app.post("/invop_bdr", function(req,res){
    var bdt = (req.body.inpbdt);
    var edt = (req.body.inpedt);
    var bdate=new Date(bdt);
    bdate=bdate.toISOString().slice(0,10);
    var edate=new Date(edt);
    edate=edate.toISOString().slice(0,10);
    var sql = "select * from records where date between '"+bdate+"' and '"+edate+"';";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.render("invoicelist",{r:result,hd:req.body.hd,un:req.session.username});
    });
});

app.post("/invop_bc", function(req,res){
    var sql ="select * from records where cid ='"+req.body.inpcl+"';";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.render("invoicelist",{r:result,hd:req.body.hd,un:req.session.username});
    });
});

// Logout route
app.post("/logout", function(req, res) {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect("/login");
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function (){
  
});
