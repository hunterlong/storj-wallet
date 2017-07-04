var ethers = require('ethers');
const {shell} = require('electron')
const {dialog} = require('electron').remote
const clipboardy = require('clipboardy');
var fs = require('fs');

var providers = ethers.providers;
var Wallet = ethers.Wallet;

var myWallet;

var tokenBalance = 0;
var ethBalance = 0;
var version = "0.0.1";

var storjUSD = 0;
var etherUSD = 0;

var provider = new providers.EtherscanProvider(false);

var tokenContract;
var TOKEN_ADDRESS = '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC'
const TOKEN_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"burnAmount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"value","type":"uint256"}],"name":"upgrade","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"upgradeAgent","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"upgradeMaster","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getUpgradeState","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"canUpgrade","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalUpgraded","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"agent","type":"address"}],"name":"setUpgradeAgent","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"isToken","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BURN_ADDRESS","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"master","type":"address"}],"name":"setUpgradeMaster","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_totalSupply","type":"uint256"},{"name":"_decimals","type":"uint256"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Upgrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"agent","type":"address"}],"name":"UpgradeAgentSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"burner","type":"address"},{"indexed":false,"name":"burnedAmount","type":"uint256"}],"name":"Burned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];

tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);


function OpenEtherScan(txid) {
  shell.openExternal('https://etherscan.io/tx/'+txid)
}

function OpenGithubRepo() {
  shell.openExternal('https://github.com/hunterlong/storj-wallet')
}

function OpenGithubReleases() {
  shell.openExternal('https://github.com/hunterlong/storj-wallet/releases')
}

function OpenHunterGithub() {
  shell.openExternal('https://github.com/hunterlong')
}

function OpenMyEtherWallet() {
  shell.openExternal('https://www.myetherwallet.com')
}

function StorjPrice() {
  var api = "https://api.coinmarketcap.com/v1/ticker/storj/";
  $.get(api, function(data, status){
    storjUSD = parseFloat(data[0]['price_usd']);
  });
}

function EtherPrice() {
  var api = "https://api.coinmarketcap.com/v1/ticker/ethereum/";
  $.get(api, function(data, status){
    etherUSD = parseFloat(data[0]['price_usd']);
  });
}

UpdatePricing();

function UpdatePricing() {
  EtherPrice();
  StorjPrice();
}


function UpdatePortfolio() {
  setTimeout(function() {
    var totalStorj = tokenBalance * storjUSD;
    var totalEth = ethBalance * etherUSD;
    var totalPort = totalStorj + totalEth;
    $("#portStorjUSD").html("($"+storjUSD+")");
    $("#portEthUSD").html("($"+etherUSD+")");
    $("#portfolioStorj").html(totalStorj.toFixed(2))
    $("#portfolioEth").html(totalEth.toFixed(2))
    $("#portfolioTotal").html(totalPort.toFixed(2))
    $(".portfolio").fadeIn('fast');
  }, 3500);
}


function CheckForUpdates() {
  var versionFile = "https://raw.githubusercontent.com/hunterlong/storj-wallet/master/VERSION";
  $.get(versionFile, function(data, status){
      var verCheck = data.replace(/^\s+|\s+$/g, '');
        if (version != verCheck) {
          alert("There's a new Update for Storj Wallet! New Version: "+data);
          OpenGithubReleases();
        } else {
          alert("You have the most current version");
        }
    });
}

function CheckETHAvailable() {
    var send = $("#send_ether_amount").val();
    var fee = $("#ethtxfee").val();
    var spendable = ethBalance - (send - fee);
    if (spendable >= 0) {
        $("#sendethbutton").prop("disabled", false);
    } else {
        $("#sendethbutton").prop("disabled", true);
    }
}

function CheckTokenAvailable() {
    var send = $("#send_amount_token").val();
    var fee = $("#tokentxfee").val();
    var spendable = tokenBalance - (send - fee);
    if (spendable >= 0) {
        $("#sendtokenbutton").prop("disabled", false);
    } else {
        $("#sendtokenbutton").prop("disabled", true);
    }
}


setInterval(function() {
    if (myWallet) updateBalance();
}, 5000);

setInterval(function() {
    if (myWallet) UpdatePortfolio();
}, 30000);

function UseKeystore() {
    HideButtons();
    $("#keystoreupload").attr("class", "");
}

function UsePrivateKey() {
    HideButtons();
    $("#privatekey").attr("class", "");
}

function UseNewWallet() {
    HideButtons();
    $("#createnewwallet").attr("class", "");
}


function CopyAddress() {
    clipboardy.writeSync(myWallet.address);
    alert("Address Copied: " + myWallet.address);
}


function HideButtons() {
    $("#keystoreupload").attr("class", "hidden");
    $("#createnewwallet").attr("class", "hidden");
    $("#privatekey").attr("class", "hidden");
}


function QuitAppButton() {
    app.quit()
}


function OpenPrivateKey() {
    var key = $("#privatepass").val();
    if (key.substring(0, 2) !== '0x') {
        key = '0x' + key;
    }
    if (key != '' && key.match(/^(0x)?[0-9A-fa-f]{64}$/)) {
        HideButtons();
        try {
            myWallet = new Wallet(key);
            console.log("Opened: " + myWallet.address)
        } catch (e) {
            console.error(e);
        }
        SuccessAccess();
        updateBalance();
        UpdatePortfolio();
    } else {
      $("#privatekeyerror").show();
    }
}


function OpenNewWallet() {
    var pass = $("#newpass").val();
    var passconf = $("#newpassconf").val();
}



function updateBalance() {
    var address = myWallet.address;
    $(".myaddress").html(address);

    provider.getBalance(address).then(function(balance) {
        var etherString = ethers.utils.formatEther(balance);
        console.log("ETH Balance: " + etherString);
        var n = parseFloat(etherString);
        var ethValue = n.toLocaleString(
            undefined, // use a string like 'en-US' to override browser locale
            {
                minimumFractionDigits: 4
            }
        );
        var messageEl = $('#ethbal');
        var split = ethValue.split(".");
        ethBalance = parseFloat(ethValue);
        messageEl.html(split[0] + ".<small>" + split[1] + "</small>");
    });

    var callPromise = tokenContract.functions.balanceOf(address);

    callPromise.then(function(result) {
        var trueBal = result[0].toString(10);
        var messageEl = $('#storjbal');
        var n = trueBal * 0.00000001;
        console.log("STORJ Balance: " + n);
        var atyxValue = n.toLocaleString(
            undefined, // use a string like 'en-US' to override browser locale
            {
                minimumFractionDigits: 4
            }
        );

        var split = atyxValue.split(".");
        tokenBalance = parseFloat(atyxValue);
        $(".storjspend").html(atyxValue)
        messageEl.html(split[0] + ".<small>" + split[1] + "</small>");

    });

}



var keyFile;
function OpenKeystoreFile() {
    dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) return;
        keyFile = fileNames[0];
        console.log(keyFile);
    });
}


function SuccessAccess() {
    $(".options").hide();
    $(".walletInput").hide();
    $("#addressArea").attr("class", "row");
    $("#walletActions").attr("class", "row");
    $(".walletInfo").attr("class", "row walletInfo");
}


function GetEthGas() {
    var price = $("#ethgasprice").val();
    var gaslimit = 21000;
    var txfee = price * gaslimit;
    $("#ethtxfee").val((txfee * 0.000000001).toFixed(5));
    UpdateAvailableETH();
    return false;
}


function GetTokenGas() {
    var price = $("#tokengasprice").val();
    var gaslimit = 65000;
    var txfee = price * gaslimit;
    $("#tokentxfee").val((txfee * 0.000000001).toFixed(5));
    UpdateTokenFeeETH();
    return false;
}


function UnlockWalletKeystore() {
    var password = $("#keystorewalletpass").val();
    var buffer = fs.readFileSync(keyFile);
    var walletData = buffer.toString();
    $("#keystorebtn").html("Decrypting...");
    $("#keystorebtn").prop("disabled", true);

    if (password!='' && keyFile!='' && Wallet.isEncryptedWallet(walletData)){

        Wallet.fromEncryptedWallet(walletData, password).then(function(wallet) {
                console.log("Opened Address: " + wallet.address);
                wallet.provider = new ethers.providers.getDefaultProvider(false);
                myWallet = wallet;
                SuccessAccess();
                updateBalance();
                UpdatePortfolio();
                $("#keystorebtn").html("Decrypting...");
        });
      } else {
        $("#keystorejsonerror").html("Invalid Keystore JSON File")
        $("#keystorejsonerror").show();
        $("#keystorebtn").prop("disabled", false);
        $("#keystorebtn").html("Open");
      }
}

function reject() {
  $("#keystorejsonerror").html("Incorrect Password for Keystore Wallet")
  $("#keystorejsonerror").show();
  $("#keystorebtn").prop("disabled", false);
  $("#keystorebtn").html("Open");
}


function ConfirmButton(elem) {
    $(elem).html("CONFIRM")
    $(elem).attr("class", "btn btn-success")
}



var lastTranx;

function SendEthereum(callback) {
    var to = $('#send_ether_to').val();
    var amount = $('#send_ether_amount').val();
    $("#sendethbutton").prop("disabled", true);
    var price = parseInt($("#ethgasprice").val()) * 1000000000;

    if (to != '' && amount != '' && parseFloat(amount) <= ethBalance) {
        myWallet.provider = new ethers.providers.getDefaultProvider(false);
        var amountWei = ethers.utils.parseEther(amount);
        var targetAddress = ethers.utils.getAddress(to);

        myWallet.send(targetAddress, amountWei, {
            gasPrice: price,
            gasLimit: 21000,
        }).then(function(txid) {
            console.log(txid);
            $("#sendethbutton").prop("disabled", false);
            $('#ethermodal').modal('hide');
            $(".txidLink").html(txid.hash);
            $(".txidLink").attr("onclick", "OpenEtherScan('"+txid.hash+"')");
            $("#senttxamount").html(amount);
            $("#txtoaddress").html(to);
            $("#txtype").html("ETH");
            $('#trxsentModal').modal('show');
            updateBalance();
        });
    }
}



function UpdateAvailableETH() {
    var fee = $("#ethtxfee").val();
    var available = ethBalance - fee;
    $(".ethspend").html(available.toFixed(6));
}


function UpdateTokenFeeETH() {
    var fee = $("#tokentxfee").val();
    var available = ethBalance - fee;
    $(".ethavailable").each(function(){
      $(this).html(available.toFixed(6));
    });
}



function SendToken(callback) {
    var to = $('#send_to_token').val();
    var amount = $('#send_amount_token').val();
    $("#sendtokenbutton").prop("disabled", true);
    var price = parseInt($("#tokengasprice").val()) * 1000000000;

    if (to != '' && amount != '' && parseFloat(amount) <= tokenBalance) {
        myWallet.provider = new ethers.providers.getDefaultProvider(false);
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, myWallet);
        tokenContract.transfer(to, (parseFloat(amount) * 100000000), {
            gasPrice: price,
            gasLimit: 65000,
        }).then(function(txid) {
            console.log(txid);
            $('#storjmodal').modal('hide')
            $("#sendtokenbutton").prop("disabled", false);

            $(".txidLink").html(txid.hash);
            $(".txidLink").attr("onclick", "OpenEtherScan('"+txid.hash+"')");
            $("#senttxamount").html(amount);
            $("#txtoaddress").html(to);
            $("#txtype").html("STORJ");
            $('#trxsentModal').modal('show');
            updateBalance();
        });
    }
}
