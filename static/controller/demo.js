app.controller('demoCtrl', function($scope, $http){

    $scope.showLoader = false;
   
    $scope.dataObj = {};
    $scope.title = '';
    $scope.summary = '';
    $scope.image = '';
    $scope.publish_date = 'NA';
    $scope.authors = 'NA';
    $scope.keywords = [];
    $scope.nouns = [];
    $scope.nerLocs = [];
    $scope.nerOrgs = [];
    $scope.nerPers = [];
    $scope.nerOthrs = [];
    $scope.nerArray = [];
    $scope.navigation = [];
    $scope.sentenceTones = [];
    $scope.newSentencetones = [];
    $scope.AngerScore = 0;
    $scope.fearScore = 0;
    $scope.joyScore = 0;
    $scope.sadScore = 0;
    $scope.analyScore = 0;
    $scope.confiScore = 0;
    $scope.tentScore = 0;
    $scope.errormsg = '';
    $scope.hideDiv = true;
    
    $scope.inputurl = '';
    $scope.disableBtn = false;
    $scope.countKey = function(){
        if ($scope.inputurl.length>0){
            $scope.disableBtn = true;
        }
        else{
            $scope.disableBtn = false;
        }        
    } 

    $scope.validInput = function(url, from){
        $scope.errormsg = '';
        if (!($scope.inputurl)){
            $scope.errormsg = 'Please provide url.!';
        }else{
            $scope.getNewsReport(url, from);    
        }
        
    }

    $scope.getNewsReport = function(url, from){
            $scope.newSentencetones = [];
            // $scope.error = false;
            $scope.errormsg = '';
            $scope.showLoader = true;
            console.log(url, from)
    		$http ({
        		url : 'newsreport',
        		headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'},  /*Content-Type': 'application/x-www-form-urlencoded*/
        		method : 'POST',
        		data: JSON.stringify({"url":url, 'ipfrom':from}),
        	}).then(function(response) {
        		console.log(response);
                if ("data" in response && response.data.status == "success"){
                    $scope.hideDiv = false;
                    $scope.showLoader = false;
                    var newObjAry = response.data.result;
                    if (newObjAry.title){
                        $scope.title = newObjAry.title; 
                    }                
                    if (newObjAry.summary){
                        $scope.summary = newObjAry.summary;
                    }
                    if (newObjAry.image){
                        $scope.image = newObjAry.image;     
                    }
                    if (newObjAry.publish_date){
                        $scope.publish_date = newObjAry.publish_date;  
                    } 
                    if (newObjAry.authors){
                        $scope.authors = newObjAry.authors;  
                    } 
                    // $scope.keywords = newObjAry.keywords;
                    if (from == "box"){
                        $scope.navigation = newObjAry.navigation;    
                    }
                    if (newObjAry.spacyResult.Nouns){
                        $scope.nouns = newObjAry.spacyResult.Nouns;
                    }
                    $scope.nerArray = newObjAry.spacyResult.nerList;
                    if ($scope.nerArray){
                        angular.forEach($scope.nerArray, function(key, value) {
                        var newKey = Object.values(key)[0];
                        var newVal = Object.keys(key)[0];
                        $scope.tmpObj = {};
                        $scope.tmpObj[newKey] = newVal;
                        if (newKey == "PERSON"){
                            $scope.nerPers.push($scope.tmpObj);
                        }else if (newKey == "ORG"){
                            $scope.nerOrgs.push($scope.tmpObj);
                        }
                        else if (newKey == "GPE"){
                            $scope.nerLocs.push($scope.tmpObj);
                        }else{
                            $scope.nerOthrs.push(newVal);
                        }     
                    });
                    }

                    if (newObjAry.toneAnaysis.document_tone.tones){
                        $scope.docTones = newObjAry.toneAnaysis.document_tone.tones;
                        angular.forEach($scope.docTones, function(tone) {
                            if (tone.tone_id == 'sadness'){
                                $scope.sadScore = tone.score ;    
                            }
                            else if (tone.tone_id == 'analytical'){
                                $scope.analyScore = tone.score;    
                            }
                            else if (tone.tone_id == 'anger'){
                                $scope.AngerScore = tone.score;
                            }
                            else if (tone.tone_id == 'fear'){
                                $scope.fearScore = tone.score;
                            }
                            else if (tone.tone_id == 'joy'){
                               $scope.joyScore = tone.score;
                            }
                            else if (tone.tone_id == 'confident'){
                               $scope.confiScore = tone.score;
                            }
                            else if (tone.tone_id == 'tentative'){
                               $scope.tentScore = tone.score;
                            }
                        });   
                    }

                    
                    if (newObjAry.toneAnaysis.sentences_tone.length>0){
                        $scope.sentenceTones = newObjAry.toneAnaysis.sentences_tone;
                        
                        angular.forEach($scope.sentenceTones, function(sent) {
                            console.log(sent)
                            if (sent.tones.length && sent.text.length>0){
                                var sentImg = '';
                                var emotionameName = '';

                                angular.forEach(sent.tones, function(sentWise) {
                                    var emotName = '';
                                    var tmpimgs = '';
                                    if (sentWise.tone_id == 'sadness'){
                                        tmpimgs = 'static/img/sad.png';
                                        emotName = 'Sadness'
                                    }
                                    else if (sentWise.tone_id == 'analytical'){
                                        tmpimgs ='static/img/analys.png';
                                        emotName = 'Analytical'   
                                    }
                                    else if (sentWise.tone_id == 'anger'){
                                       tmpimgs ='static/img/angry.png';
                                       emotName = 'Anger'   
                                    }
                                    else if (sentWise.tone_id == 'fear'){
                                        tmpimgs ='static/img/fear.png';
                                        emotName = 'Fear'   
                                    }
                                    else if (sentWise.tone_id == 'joy'){
                                      tmpimgs ='static/img/laughing.png';
                                      emotName = 'Joy'   
                                    }
                                    else if (sentWise.tone_id == 'confident'){
                                       tmpimgs ='static/img/happy.png';
                                       emotName = 'Confident'   
                                    }
                                    else if (sentWise.tone_id == 'tentative'){
                                       tmpimgs ='static/img/Neutral.png';
                                       emotName = 'Tentative'   
                                    }
                                    sentImg = tmpimgs;
                                    emotionameName = emotName;
                                })
                                sent['img'] = sentImg;
                                sent['emoname'] = emotionameName;
                            }
                            $scope.newSentencetones.push(sent);
                        });
                    }
                    console.log($scope.newSentencetones);
                    

                }
                else{
                    $scope.showLoader = false;
                    $scope.errormsg = 'Not able to fetch the result due to website security';
                    $scope.hideDiv = true;
                }
                
        	})

    	}

})
