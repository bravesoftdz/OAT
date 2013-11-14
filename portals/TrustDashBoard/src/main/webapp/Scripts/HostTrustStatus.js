var trustPolicyError = false;
var locationPolicyError = false;
//This variable will contains name of all VMWare Host type. 
var VMWareHost = [];
var VMWareHostLocation = [];

//Called on load of HostTrustStatus..jsp
$(function() {
	$('#mainTrustDetailsDiv').prepend(disabledDiv);
	sendJSONAjaxRequest(false, 'getData/getDashBoardData.html', null, populateHostTrustDetails, null);
	
});

//This function will create Host trust Status Table.
function populateHostTrustDetails(responsJSON) {
	$('#disabledDiv').remove();
	if (responsJSON.result) {
		$('#mainTrustDetailsDivHidden').show();
		populateHostTrustDataIntoTable(responsJSON.hostVo);
		//This statement will create pagination div based on the no_of_pages
		applyPagination('hostTrustPaginationDiv',responsJSON.noOfPages,fngetHostTrustNextPage,1);
	}else {
                if(responsJSON.noHosts) {
                    $('#hostTrustPaginationDiv').html('<span>'+getHTMLEscapedMessage(responsJSON.message)+'</span>');
                }else{
                    $('#errorMessage').html('<span class="errorMessage">'+getHTMLEscapedMessage(responsJSON.message)+'</span>');
                }
	}
}

/*This Function will create a trust status table based on the host list provided.*/
function populateHostTrustDataIntoTable(hostDetails) {
	var str = "";
		VMWareHost = [];
		VMWareHostLocation = [];
        
		for ( var item in hostDetails) {
            
			var classValue = null;
			if(item % 2 === 0){classValue='evenRow';}else{classValue='oddRow';}
			str+='<tr class="'+classValue+'" hostID="'+hostDetails[item].hostID+'" id="host_div_id_'+hostDetails[item].hostName.replace(/\./g,'_')+'">'+
				'<td align="center" class="row1"><a onclick="fnColapse(this)" isColpase="true"><img class="imageClass" border="0" alt="-" src="images/plus.jpg"></a></td>'+
				'<td class="row2">'+hostDetails[item].hostName+'</td>'+
                
				'<td align="center" class="row3"><img border="0" src="'+hostDetails[item].osName+'"></td>';
				var value = hostDetails[item].hypervisorName != "" ? '<img border="0" src="'+hostDetails[item].hypervisorName+'">' : '';
				str+='<td align="center" class="row4">'+value+'</td>';
				//TODO : 
				 // Loaction Policy 
				 //according to email on Fri 9/14/2012 10:21 AM
				  //Item: 5
				//To remove the location from main page commnet thr below line and un uncommnet the next line 
			    value = hostDetails[item].location != undefined ? hostDetails[item].location : "";
				//value="";
				str+='<td class="row5">'+value+'</td>'+
				(hostDetails[item].biosStatus != undefined? 
					'<td align="center" class="row6"><img border="0" src="'+hostDetails[item].biosStatus+'"></td>': 
					'<td align="center" celass="row6"><img border="0" src="images/Trusted.png"></td>') +
				(hostDetails[item].vmmStatus != undefined?
					'<td align="center" class="row7"><img border="0" src="'+hostDetails[item].vmmStatus+'"></td>':
					'<td align="center" class="row7"><img border="0" src="images/Trusted.png"></td>') +
				(hostDetails[item].overAllStatus != undefined?
					'<td align="center" class="row8"><img border="0" src="'+hostDetails[item].overAllStatus+'"></td>':
					'<td align="center" class="row8"><img border="0" src="images/Trusted.png"></td>');
				/*if (!(hostDetails[item].overAllStatusBoolean)) {
					str+='<td class="rowHelp"><input type="image" onclick="showFailureReport(\''+hostDetails[item].hostName+'\')" src="images/helpicon.png" alt="Failure Report"></td>';
				}else {
					str+='<td class="rowHelp"></td>';
					
				}*/
				
				str+='<td class="row9">'+hostDetails[item].updatedOn+'</td>'+
				'<td nowrap align="center" class="row10"><input class="tableButton" type="button"  value="Refresh" onclick="fnUpdateTrustForHost(this)"></td>'+
				'<td align="center" class="row11"><a><img src="images/trust_assertion.png" onclick="fnGetTrustSamlDetails(\''+hostDetails[item].hostName+'\')"/></a></td>'+
			    '<td class="rowHelp"><input type="image" onclick="showFailureReport(\''+hostDetails[item].hostName+'\')" src="images/trust_report.png" alt="Failure Report"></td>'+
				'<td class="row12">';
				
				if(hostDetails[item].errorMessage != null){str+='<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+hostDetails[item].errorMessage+'</textarea>';}
				str+='</td>'+
			'</tr>';
				
			str+='<tr style="display: none;">';
                                                                        str+='<td class="'+classValue+'" colspan="13">'+
                                                                                '<div class="subTableDiv" style="text-align: left;">This feature is currently not implemented.</div>'+
                                                                                '</td>';
		}
		$('#mainTrustDetailsContent table').html(str);
}

function fnGetTrustSamlDetails(hostName) {
	window.open("getView/trustVerificationDetails.html?hostName="+hostName,"","location=0,menubar=0,status=1,scrollbars=1, width=700,height=600");
	//Window.open('getData/getHostTrustSatusForPageNo.html',hostName,'width=200,height=100');
}

function fngetHostTrustNextPage(pageNo) {
	$('#errorMessage').html('');
	$('#mainTrustDetailsDiv').prepend(disabledDiv);
	sendJSONAjaxRequest(false, 'getData/getHostTrustSatusForPageNo.html', "pageNo="+pageNo, fnUpdateTableForPage, null);
}

function fnUpdateTableForPage(responseJSON) {
	$('#disabledDiv').remove();
	if (responseJSON.result) {
		populateHostTrustDataIntoTable(responseJSON.hostVo);
	}else {
		$('#errorMessage').html(getHTMLEscapedMessage(responseJSON.message));
	}
}

function fnColapse(element){
	$('#errorMessage').html('');
	var isColpase =  $(element).attr('isColpase');
	
	$(element).parent().parent().next().toggle();
	if (isColpase == 'true') {
		$(element).html('<img border="0" src="images/minus.jpg">');
		$(element).attr('isColpase',false);
		
	}else {
		$(element).html('<img border="0" src="images/plus.jpg">');
		$(element).attr('isColpase',true);
	}
}


//function to open popup, and show Failure Attestation Report
function showFailureReport(hostName) {
	var str = '<div id="showFailureReportTable" class="failureReportdiv"></div>';
	/* Soni_Begin_27/09/2012_Changing thetitle of pop window from "Failure Report for to Trust Report for  */
    //fnOpenDialog(str,"Failure report for "+ hostName, 950, 600,false);
	fnOpenDialog(str,"Trust Report", 950, 600,false);
    /* Soni_Begin_27/09/2012_Changing thetitle of pop window from "Failure Report for to Trust Report for  */
    
    $('#showFailureReportTable').prepend(disabledDiv);
    sendJSONAjaxRequest(false, 'getData/getFailurereportForHost.html',"hostName="+hostName , getFailureReportSuccess, null);
}


function byProperty(property) {
    return function (a,b) {
        return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    }
}

function getFailureReportSuccess(responseJSON) {
	$('#disabledDiv').remove();
	if(responseJSON.result){
        var reportdata = responseJSON.reportdata;
        var str ="";
        str+='<div class="tableDisplay"><table width="100%" cellpadding="0" cellspacing="0">'+
              '<thead><tr>'+
              '<th class="failureReportRow1"></th>'+
              '<th class="failureReportRow2">PCR Name</th>'+
              '<th class="failureReportRow3">PCR Value</th>'+
              '<th class="failureReportRow4">WhiteList Value</th>'+
              '</tr></thead></table></div>';
          
          str+='<div class="" style="overflow: auto;">'+
              '<table width="100%" cellpadding="0" cellspacing="0"><tbody>';
          
          var classValue = null;
          
          // PCRs should be ordered. issue #460 
          reportdata.sort(byProperty("name")); // name is PCR Name
          
        for(var item in reportdata){
                if(item % 2 === 0){classValue='evenRow';}else{classValue='oddRow';}
                var styleUntrusted = reportdata[item].trustStatus == 0 ? "color:red;" : "";
                str+='<tr class="'+classValue+'">'+
                        '<td align="center" class="failureReportRow1"></td>'+
                        '<td class="failureReportRow2">'+reportdata[item].name+'</td>'+
                        '<td class="failureReportRow3" style="'+styleUntrusted+'" >'+reportdata[item].value+'</td>'+
                        '<td class="failureReportRow4" >'+reportdata[item].whiteListValue+'</td>'+
                        '</tr>';
                str+='<tr style="display: none;">';
                str+="</tr>";
        }
       
        str+='</tbody> </table></div>';
        $('#showFailureReportTable').html('<div>'+str+'</div>');
        
          }else{
        $('#showFailureReportTable').html('<div class="errorMessage">'+responseJSON.message+'</div>');
    }
}

//This function is used to get Trust Status for single Host. Called on click of refresh button.
function fnUpdateTrustForHost(element) {
	$('#errorMessage').html("");
	var row = $(element).parent().parent();
	var hostName = $.trim($(row).find('td:eq(1)').text());
	$(element).attr('value','Updating');
	row.find('td:eq(12)').html('<img border="0" src="images/ajax-loader.gif">');
	sendJSONAjaxRequest(false, 'getData/getHostTrustStatus.html', "hostName="+hostName, updateTrustStatusSuccess, null,element,hostName);
}

function updateTrustStatusSuccess(response,element,host) {
	$(element).attr('value','Refresh');
	var row = $(element).parent().parent();
	if (response.result) {
		if (response.hostVo.biosStatus != undefined)
			row.find('td:eq(5)').html('<img border="0" src="'+response.hostVo.biosStatus+'">');
		else
			row.find('td:eq(5)').html('<img border="0" src="images/Trusted.png">');
		if (response.hostVo.vmmStatus != undefined)
			row.find('td:eq(6)').html('<img border="0" src="'+response.hostVo.vmmStatus+'">');
		else
			row.find('td:eq(6)').html('<img border="0" src="images/Trusted.png">');
		if (response.hostVo.overAllStatus != undefined)
			row.find('td:eq(7)').html('<img border="0" src="'+response.hostVo.overAllStatus+'">');
		else
			row.find('td:eq(7)').html('<img border="0" src="images/Trusted.png">');
		row.find('td:eq(8)').html(response.hostVo.updatedOn);
		if (response.hostVo.errorCode != 0) {
			row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+response.hostVo.errorMessage+'</textarea>');
		}else{
			row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">Host Trust status updated successfully.</textarea>');
		}
	}else {
		row.find('td:eq(12)').html('<textarea class="textAreaBoxClass" cols="20" rows="2" readonly="readonly">'+response.message+'</textarea>');
	}
}
