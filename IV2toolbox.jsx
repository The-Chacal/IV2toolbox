//****************************************//
//   IV2 toolbox v1.5
//****************************************//

$.localize = true;
creatingUI( this );
//exportingShot();
//creatingAEP( "104" , "50" , "120" );
//IV2choiceDlg("Error" , "   The shot \"IV2_v1.0\" already exists.\n\n   Do you really want to overwrite it?" , "Crush it!" , "Let it Live!")

//Creates the UI.
//Return = Ø
function creatingUI( thisObj ){
    
    var iv2Toolbox = thisObj ;
    iv2Toolbox.spacing = 2 ;
    iv2Toolbox.shotLine = iv2Toolbox.add( "group" );
    iv2Toolbox.shotLine.orientation = "row" ;
    iv2Toolbox.shotLine.alignChildren = [ "fill" , "center" ];
    iv2Toolbox.shotLine.spacing = 0 ;
    iv2Toolbox.shotLine.add( "staticText" , undefined , "Shot :" );
    var episode = iv2Toolbox.shotLine.add( "editText{ text: 'XXX' , justify : 'center' , characters : 3 }");
    iv2Toolbox.shotLine.add( "staticText" , undefined , "_" );
    var sequence = iv2Toolbox.shotLine.add( "editText{ text: 'XXX' , justify : 'center' , characters : 3 }");
    iv2Toolbox.shotLine.add( "staticText" , undefined , "_" );
    var shot = iv2Toolbox.shotLine.add( "editText{ text: 'XXX' , justify : 'center' , characters : 3 }");
    iv2Toolbox.btnsLine = iv2Toolbox.add( "group" );
    iv2Toolbox.btnsLine.spacing = 0 ;
    var createShot = iv2Toolbox.btnsLine.add( "button" , undefined , "Create" );
    createShot.size = [ 75 , 25 ];
    var ExportShot = iv2Toolbox.btnsLine.add( "button" , undefined , "Export" );
    ExportShot.size = [ 75 , 25 ];
    var updateScript = iv2Toolbox.btnsLine.add( "button" , undefined , "X" );
    updateScript.helpTip = "Updates the Script\nYou'll need to reboot After Effects." ;
    updateScript.size = [ 25 , 25 ];
    
    iv2Toolbox.layout.layout( "true" );
    
    var savedEpisodeNb = IV2getSavedString( "IV2toolboxSave" , "IV2episodeNB" );
    if( savedEpisodeNb != "" ){ episode.text = savedEpisodeNb ; }
    var savedSequenceNb = IV2getSavedString( "IV2toolboxSave" , "IV2sequenceNB" );
    if( savedSequenceNb != "" ){ sequence.text = savedSequenceNb ; }
    var savedShotNb = IV2getSavedString( "IV2toolboxSave" , "IV2shotNB" );
    if( savedShotNb != "" ){ shot.text = savedShotNb ; }


    episode.onActivate = function(){ episode.text = "" ; }
    sequence.onActivate = function(){ sequence.text = "" ; }
    shot.onActivate = function(){ shot.text = "" ; }
    createShot.onClick = function(){ creatingAEP( episode.text , sequence.text , shot.text ); }
    ExportShot.onClick = exportingShot ;
    updateScript.onClick = updatingScript ;
    
}
/**
 * Update the script from my Teamshare folder.
 */
function updatingScript(){
    var scriptFolder = new Folder( "//peps/studioPEP/TEAM SHARE/Sylvain LORENT/ScriptsAE" );
    var scriptFiles = scriptFolder.getFiles( "IV2toolbox*" );
    var targetFolder = new Folder( Folder.userData.fsName + "/Adobe/After Effects/18.4/Scripts/ScriptUI Panels" );
    if( !targetFolder.exists ){ targetFolder.create(); }
    for( var i = 0 ; i < scriptFiles.length ; i++ ){
        copyFiles( scriptFiles[i] , targetFolder );
    }
}
/**
 * Copies the File/Folder to the destination.
 * @param { object } item Item to Copy.
 * @param { object } destination Folder to copy into.
 */
function copyFiles( item , destination ){
    if( item instanceof Folder ){
        var newFolder = new Folder( destination.fsName + "/" + item.name )
        newFolder.create()
        var folderFiles = item.getFiles();
        for( var i = 0 ; i < folderFiles.length ; i++ ){
            copyFiles( folderFiles[i] , newFolder );
        }
    } else {
        item.copy( destination.fsName + "\\" + item.name );
    }
}

//Adds the main Comp to the render queue.
//Return = Ø
function exportingShot(){
    if( app.project != undefined && app.project.file.name.search( "IV2" ) >= 0 ){
        //Cleaning the renderQueue
        while( app.project.renderQueue.items.length > 0 ){
            app.project.renderQueue.items[1].remove();
        }
        //Getting the Comp to Export.
        var exportName = app.project.file.name.replace( "%20" , " " ).slice( 0 , app.project.file.name.length - 6 );
        var itemToExport = findItem( exportName );
        //Getting the Ivandoe S02 Folder.
        var iv2Folder = IV2getSavedString( "IV2toolboxSave" , "iv2Folder" );
        if( iv2Folder == "" ){
            iv2Folder = Folder.myDocuments.selectDlg( "Where is your \"IV2\" Folder?" );
            if( iv2Folder != null ){
                if( iv2Folder.name == "IV2" ){
                    IV2saveString( "IV2toolboxSave" ,  "iv2Folder" , iv2Folder.fsName );
                } else {
                    IV2dlg( "Error" , undefined , "   You did not select a Folder named \"IV2\".");
                    return ;
                }
            } else {
                return ;
            }
        } else {
            iv2Folder = new Folder( iv2Folder );
        }
        //Getting the Episode Folder.
        var episodeFolder = new Folder( iv2Folder.fsName + "/IV2_Ep" + exportName.slice( 4 , 7) )
        if( !episodeFolder.exists ){ IV2dlg( "Error" , undefined , "   You want to export a shot you don't have the files for on your computer?\n\n   I won't do it!"); return ; }
        //Adding the Comp to the render queue.
        if( itemToExport != null && itemToExport.parentFolder == app.project.rootFolder ){
            var mainCompRender = app.project.renderQueue.items.add( itemToExport );
            mainCompRender.applyTemplate( "MySettings - WorkAreaLength" );
            mainCompRender.outputModules[1].applyTemplate( "AppleProRes 422 HQ" );
            mainCompRender.outputModules[1].file = new File( episodeFolder.fsName + "/03_Exports/" + itemToExport.name + ".mov" );
        }
    }
}
//Creates a AEP file for the asked shot.
//episodeNb = String - number of the Episode | sequenceNb = String - number of the Sequence | shotNb = String - number of the Shot
//Return = Ø
function creatingAEP( episodeNb , sequenceNb , shotNb ){

    //Cleaning the numbers entered by the user.
    episodeNb = cleanNumberString( "Episode" , episodeNb , 3 );
    sequenceNb = cleanNumberString( "Sequence" , sequenceNb , 4 );
    shotNb = cleanNumberString( "Shot" , shotNb , 3 );
    if( episodeNb == null || sequenceNb == null || shotNb == null ){ return };//if any was not a number, the script stops.
    //Getting the Ivandoe S02 Folder.
    var iv2Folder = IV2getSavedString( "IV2toolboxSave" , "iv2Folder" );
    if( iv2Folder == "" ){
        iv2Folder = Folder.myDocuments.selectDlg( "Where is your \"IV2\" Folder?" );
        if( iv2Folder != null ){
            if( iv2Folder.name == "IV2" ){
                IV2saveString( "IV2toolboxSave" ,  "iv2Folder" , iv2Folder.fsName );
            } else {
                IV2dlg( "Error" , undefined , "   You did not select a Folder named \"IV2\".");
                return ;
            }
        } else {
            return ;
        }
    } else {
        iv2Folder = new Folder( iv2Folder );
    }
    //Checking if the Episode Folder exists.
    var episodeFolder = new Folder( iv2Folder.fsName + "/IV2_Ep" + episodeNb )
    if( !episodeFolder.exists ){ IV2dlg( "Error" , undefined , "   You want to work on an episode you still don't have the files for?\n\n   Don't be so presumptuous!"); return ; }
    //Checking if the Shot exists.
    var episodeJSONfile = new File( episodeFolder.fsName + "/01_Assets/01_Library/IV2_" + episodeNb + " - EnvironmentAssetsByShots.json" );
    if( !episodeJSONfile.exists ){ IV2dlg( "Error" , undefined , "   You are missing the JSON File of your episode.\n\n   Can't work without, sorry." ); return ; }
    episodeJSONfile.open( "r" );
    var episodeShotList = episodeJSONfile.read();
    episodeJSONfile.close();
    episodeShotList = JSON.parse( episodeShotList );
    var shotCode = episodeNb + "_" + sequenceNb + "_" + shotNb ;
    var shotExists = false ;
    var environmentAssetName = "" ;
    for( var i = 0 ; i < episodeShotList.length ; i++ ){
        if( episodeShotList[i].ShotCode == shotCode ){
            shotExists = true ;
            environmentAssetName = episodeShotList[i].AssetsEnvironment ;
            break ;
        }
    }
    if( !shotExists ){ IV2dlg( "Error" , undefined , "   The shot you want to work on is not on my list." ); return ; }
    IV2saveString( "IV2toolboxSave" , "IV2episodeNB" , episodeNb );
    IV2saveString( "IV2toolboxSave" , "IV2sequenceNB" , sequenceNb );
    IV2saveString( "IV2toolboxSave" , "IV2shotNB" , shotNb );
    //Creating the aep file for the shot.
    var shotFile = new File( episodeFolder.fsName + "/02_AEP/IV2_" + shotCode + " v1.0.aep" );
    if( shotFile.exists ){
        var userChoice = IV2choiceDlg( shotCode );
        if( userChoice == "Cancel" ){
            return ;
        } else if( userChoice == "Open"){
            app.open( shotFile );
            return ;
        }
    }
    //Opening the template.
    var templateFolder = new Folder( episodeFolder.fsName + "/01_Assets/01_Library/01_AEPlib" );
    var templateFile = new File( templateFolder.getFiles( "IV2_FilterTemplate v*" )[0] );
    if( !templateFile.exists ){ IV2dlg( "Error" , undefined , "   I can't find the IV2 Filter Template so I'll stop working."); return ; }
    if( app.project != undefined ){ if( !app.project.close( CloseOptions.PROMPT_TO_SAVE_CHANGES ) ){ return ; } }
    app.open( templateFile );
    app.project.save( shotFile );
    //Locating items needed in the project.
    var mainCompItem = findItem( "IV2_XXX" );
    var contentCompItem = findItem( "IV2_XXX - Content" );
    var assetsFolderItem = findItem( "Assets" );
    //Renaming Comps
    mainCompItem.name = "IV2_" + shotCode + " v1.0" ;
    contentCompItem.name = "IV2_" + shotCode + " - Content" ;
    //Importing Animatic and placing it in the "Assest" Folder.
    var animaticItem = null ;
    var animaticFile = new Folder( episodeFolder.fsName + "/01_Assets/02_Animatic" ).getFiles( shotCode + "*.mp4" )[0];
    if( animaticFile != undefined && animaticFile.exists ){
        animaticItem = app.project.importFile( new ImportOptions( animaticFile ) );
        animaticItem.parentFolder = assetsFolderItem ;
    }
    //Importing AnimationRef and placing it in the "Assest" Folder.
    var animationRefItem = null ;
    var animationRefFile = new Folder( episodeFolder.fsName + "/01_Assets/03_Animation" ).getFiles( "*" + shotCode + "*.mp4" )[0];
    if( animationRefFile != undefined && animationRefFile.exists ){
        animationRefItem = app.project.importFile( new ImportOptions( animationRefFile ) );
        animationRefItem.parentFolder = assetsFolderItem ;
    }
    //Importing Animation Layers in a "Animation" Folder and placing it in the "Assets" Folder.
    var animationItems = [] ;
    var shotAnimationFolder = new Folder( episodeFolder.fsName + "/01_Assets/03_Animation" ).getFiles( "*" + shotCode + "*_Exports" )[0];
    if( shotAnimationFolder != undefined && shotAnimationFolder.exists ){
        var animationFiles = shotAnimationFolder.getFiles( "*.swf" )
        if( animationFiles.length > 0 ){
            for( i = 0 ; i < animationFiles.length ; i++ ){
                animationItems.push( app.project.importFile( new ImportOptions( animationFiles[i] ) ) );
            }
            var animationFolderItem = app.project.items.addFolder( "Animation" );
            for( i = 0 ; i < animationItems.length ; i++ ){
                animationItems[i].parentFolder = animationFolderItem ;
            }
            animationFolderItem.parentFolder = assetsFolderItem ;
        }
    }
    //Importing Environment and placing it in the "Assets" Folder.
    var environmentItem = null ;
    var environmentAssetsList = new Folder( episodeFolder.fsName + "/01_Assets/04_Environment" ).getFiles( "*.psd" );
    for( i = 0 ; i < environmentAssetsList.length ; i++ ){
        if( environmentAssetsList[i].name.search( new RegExp( "_" + environmentAssetName + "_" , "gi") ) >= 0 ){
            var environmentImportOptns = new ImportOptions( environmentAssetsList[i] )
            environmentImportOptns.importAs = ImportAsType.COMP ;
            environmentItem = app.project.importFile( environmentImportOptns );
            break ;
        } 
    }
    if( environmentItem != null ){
        environmentItem.parentFolder = assetsFolderItem ;
        environmentItem.frameRate = 25 ;
        var alphaSolver = environmentItem.layers.addSolid( [ 0 , 0 , 0 ] , "alphaSolver" , environmentItem.width , environmentItem.height , 1 , environmentItem.duration );
        alphaSolver.moveToEnd();
        environmentLayersFolderItem = findItem( environmentItem.name + " Layers" );
        environmentLayersFolderItem.parentFolder = assetsFolderItem ;
    }
    //Preparing the Content Composition.
    contentCompItem.openInViewer();
    if( animationRefItem != null ){ contentCompItem.duration = animationRefItem.duration ; }
    //Adding the animatic to the content comp.
    if( animaticItem != null ){
        var animaticLayer = contentCompItem.layers.add( animaticItem );
        animaticLayer.name = "Ref - animaticLayer" ;
        animaticLayer.guideLayer = true ;
        animaticLayer.label = 0 ;
        animaticLayer.moveToEnd();
        animaticLayer.property( "ADBE Transform Group" ).property( "ADBE Scale" ).setValue( [ 50 , 50 ] );
        animaticLayer.property( "ADBE Transform Group" ).property( "ADBE Position" ).setValue( [ 150 + animaticLayer.width / 4 , 150 + animaticLayer.height / 4 ] );
        animaticLayer.property( "ADBE Transform Group" ).property( "ADBE Opacity" ).setValue( 50 );
        animaticLayer.locked = true ;
    }
    //Adding the ref animation to the content comp.
    if( animationRefItem != null ){
        var animationRefLayer = contentCompItem.layers.add( animationRefItem );
        animationRefLayer.name = "Ref - Anim" ;
        animationRefLayer.audioEnabled = false ;
        animationRefLayer.guideLayer = true ;
        animationRefLayer.label = 0 ;
        animationRefLayer.moveToEnd();
        animationRefLayer.property( "ADBE Transform Group" ).property( "ADBE Opacity" ).setValue( 50 );
        animationRefLayer.locked = true ;
    }
    //Adding the animation layers to the content comp.
    if( animationItems != [] ){
        for( i = 0 ; i < animationItems.length ; i++ ){
            var animationLayer = contentCompItem.layers.add( animationItems[i] );
            animationLayer.label = 3 ;
            animationLayer.name = animationLayer.name.slice( 7 , animationLayer.name.length - 4 );
            animationLayer.moveToEnd();
        }
    }
    //adding the environment to the content comp.
    if( environmentItem != null ){
        var environmentLayer = contentCompItem.layers.add( environmentItem );
        environmentLayer.label = 5 ;
        environmentLayer.name = "Environment" ;
        environmentLayer.moveToEnd();
        //Adjusting the Environment Comp duration to the content Comp.
        if( environmentItem.duration != contentCompItem.duration ){
            IV2editCompDuration( environmentItem , contentCompItem.duration );
            environmentLayer.outPoint = environmentLayer.inPoint + environmentItem.duration ;
        }
    }
    //Triming the layers to Content Comp duration.
    contentCompItem.layers[1].locked = false ;//Exception for the Overspill layer.
    app.executeCommand( 2360 );//Executes the command "Trim Comp to Work Area".
    contentCompItem.layers[1].locked = true ;
    //Preparing the Main Composition.
    if( animationRefItem != null ){ mainCompItem.duration = animationRefItem.duration ; }
    for( i = 5 ; i <= mainCompItem.layers.length ; i++ ){
        mainCompItem.layers[i].audioEnabled = false ;
    }
    if( animaticItem != null ){
        var soundLayer = mainCompItem.layers.add( animaticItem );
        soundLayer.name = "Ref - Sound" ;
        soundLayer.enabled = false ;
        soundLayer.moveToEnd();
        soundLayer.locked = true ;
    }
    //Triming the layers to Main Comp duration.
    mainCompItem.openInViewer();
    app.executeCommand( 2360 );//Executes the command "Trim Comp to Work Area".
    app.executeCommand( 23 )//Executes the command "Select All".
    app.executeCommand( 2771 )//Executes the command "RevealAllModifiedProperties".
    app.executeCommand( 2771 )//Executes the command "RevealAllModifiedProperties". - We do it a second time in order to "close" the layers.
    app.executeCommand( 2004 )//Executes the command "Deselect All".
    //Preparing the Export;
    while( app.project.renderQueue.items.length > 0 ){
        app.project.renderQueue.items[1].remove();
    }
    var mainCompRender = app.project.renderQueue.items.add( mainCompItem );
    mainCompRender.applyTemplate( "MySettings - WorkAreaLength" );
    mainCompRender.outputModules[1].applyTemplate( "AppleProRes 422 HQ" );
    mainCompRender.outputModules[1].file = new File( episodeFolder.fsName + "/03_Exports/" + mainCompItem.name + ".mov" );
    //Showing the content Comp.
    contentCompItem.openInViewer();
    //Saving the work done.
    app.project.save();
    //Displaying a warning about missing Assets.
    if( animaticItem == null || animationRefItem == null || animationItems.length == 0 || environmentItem == null ){
        var missingAssets = "" ;
        if( animaticItem == null ){ missingAssets += " • Animatic not Found.\n" ; }
        if( animationRefItem == null ){ missingAssets += " • Animation Ref Video not Found.\n" ; }
        if( animationItems.length == 0 ){ missingAssets += " • Animation Layers not Found.\n" ; }
        if( environmentItem == null){ missingAssets += " • Environment \"" + environmentAssetName + "\" not Found." ; }
        printLostAssets( shotCode , missingAssets );
    } else {
        IV2dlg( "I'm Done!" , shotCode + " : " , "   I've done my part, now do yours!" );
    }

}
//Opens a palette with the list of assets that have not been found.
//shot = String - ShotCode for the shot | list = String - String saying what's missing.
//Return = Ø
function printLostAssets( shot , list ){

    var LostAssetsDlg = new Window( "palette" , "Lost Assets" , undefined , { borderless: true , resizeable: true } );
    LostAssetsDlg.spacing = 2 ;
    var ListPanel = LostAssetsDlg.add( "Panel" , undefined , "For shot : " + shot )
    ListPanel.alignment = "Fill" ;
    ListPanel.margins = [ 2 , 10 , 2 , 2 ] ;
        var PropList = ListPanel.add( "edittext" , undefined , list , { multiline: true } );
        PropList.preferredSize = [ 200  , -1 ];
    var Btn = LostAssetsDlg.add( "button" , undefined , "Exit" );
    Btn.size = [ 75 , 25 ];
    Btn.alignment = "Center";
    LostAssetsDlg.onResizing = function(){ LostAssetsDlg.layout.resize(); }
    Btn.onClick = function(){ LostAssetsDlg.close(); }
    LostAssetsDlg.show();

}
//Modifies a comp, and its component, duration to match the value set.
//item = Object - the item to modify | durationWanted = number - Duration the user want
//Return = Ø
function IV2editCompDuration( item , durationWanted ){

    if( item.typeName == "Composition" && item.duration != durationWanted ){
        var oldDuration = item.duration ;
        item.duration = durationWanted ;
        for( var i = 1 ; i <= item.layers.length ; i++ ){
            var isLocked = item.layers[i].locked ;
            if( isLocked ){ item.layers[i].locked = false ; }
            if( item.layers[i].source.typeName == "Composition" && item.layers[i].duration != durationWanted ){
                IV2editCompDuration( item.layers[i].source , durationWanted );
                if(  Math.round( item.layers[i].outPoint * 100 ) / 100 == item.layers[i].inPoint + oldDuration ){
                    item.layers[i].outPoint = item.layers[i].inPoint + durationWanted ;
                }
            } else if( Math.round( item.layers[i].outPoint * 100 ) / 100 == oldDuration ){
                item.layers[i].outPoint = durationWanted ;
            }
            if( isLocked ){ item.layers[i].locked = true ; }
        }
    }

}
//Checks if the user entry is a number and return a string with the number of digits wanted
//numberName = String - Name of the number | entry = String - String given by the user | digitsNb = number - number of digits wanted for the final string
//Return = String or null - String containing the number entered with the number of digits wanted
function cleanNumberString( numberName , entry , digitsNb){

    entry = parseInt( entry , 10 );
    if( isNaN( entry ) ){
        IV2dlg( "Error" , undefined , "   The " + numberName + " number you entered is invalid.")
        return null ;
    }
    entry = entry.toString();
    while( entry.length < digitsNb )
    {
        entry = "0" + entry ;
    }
    return entry ;

}
//Parses the items of the project to find an item matching the entered name.
//,ame = String - Name of the item searched
//Return = Object or null - item matching the name.
function findItem( itemName ){

    for( var i = 1 ; i <= app.project.items.length ; i++ ){
        var testedItem = app.project.items[i];
        if( testedItem.name == itemName ){
            return testedItem ;
        }
    }
    return null ;

}
//Opens a dialog with a message for the user.
//Title = String - Name of the Dialog | Content = String - Message displayed
//Return = Ø
function IV2dlg( Title , PanelName , Content ){
    
    var IV2dialog = new Window( "dialog" , Title , undefined , { borderless: true } );
    IV2dialog.spacing = 5
        IV2dialog.global = IV2dialog.add( "Panel" , undefined , PanelName );
            IV2dialog.global.msg = IV2dialog.global.add( "statictext" , undefined , Content, { multiline: true } );
            IV2dialog.global.msg.alignment = "Center" ;
        IV2dialog.Btn = IV2dialog.add( "Button" , undefined , "Ok" );
        IV2dialog.Btn.size = [ 75 , 25 ];
    IV2dialog.show();
      
}
//Opens a dialog giving a choice to the user.
//title = String - Name of the Dialog | messageContent = String- Message displayed | (Optional) messageBtnA = String - Text on the first Button | (Optional) messageBtnB = String - Text on the second Button
//Return = Boolean
function IV2choiceDlg( shot ){

    var choiceDialog = new Window( "dialog" , "Error" , undefined , { borderless: true } );
        choiceDialog.global = choiceDialog.add( "group" );
        choiceDialog.global.orientation = "column" ;
        choiceDialog.global.spacing = 2 ;
            choiceDialog.global.panel = choiceDialog.global.add( "panel" );
            choiceDialog.global.panel.message = choiceDialog.global.panel.add( "staticText" , undefined , "   The shot \"IV2_" + shot + " v1.0\" already exists.\n\n   Do you really want to overwrite it?" , { multiline : true } );
            choiceDialog.global.btnsRow = choiceDialog.global.add( "group" );
            choiceDialog.global.btnsRow.spacing = 0 ;
                var btnA = choiceDialog.global.btnsRow.add( "button" , undefined , "Crush it!" );
                btnA.size = [ 75 ,25 ];
                var btnB = choiceDialog.global.btnsRow.add( "button" , undefined , "Let it Live!" );
                btnB.size = [ 75 ,25 ];
                var btnC = choiceDialog.global.btnsRow.add( "button" , undefined , "Open it!" );
                btnC.size = [ 75 ,25 ];
    var isAgreed = false ;
    choiceDialog.onResizing = function(){ choiceDialog.layout.resize(); }
    btnA.onClick = function(){ isAgreed = "Crush" ; choiceDialog.close(); };
    btnB.onClick = function(){ isAgreed = "Cancel" ; choiceDialog.close(); };
    btnC.onClick = function(){ isAgreed = "Open" ; choiceDialog.close(); };
    choiceDialog.show();
    return isAgreed ;

}

//Saves a String inside a given txt file in the user roaming folder
//SaveFileName = String - Name of the text file | StringName = String - Name of the String | StringToSave = String - The actual String
//Return = Ø
function IV2saveString( SaveFileName , StringName , StringToSave ){

    var SaveFile = new File( Folder.userData.fsName + "/" + SaveFileName + ".txt" );
    if( SaveFile.exists )
    {
        SaveFile.open( "r" );
        var SaveFileString = SaveFile.read();
        SaveFile.close()
        var StringNameIndex = SaveFileString.search( StringName );
        if( StringNameIndex != -1 )
        {
            var StringStartIndex = StringNameIndex + StringName.length + 1 ;
            var StringEndIndex = SaveFileString.search( "</Path" + StringName + ">" );
            var OldString = SaveFileString.slice( StringStartIndex , StringEndIndex );
            SaveFileString = SaveFileString.replace( OldString , StringToSave );
        } else {
            SaveFileString = SaveFileString.concat( "<Path" + StringName + ">" + StringToSave + "</Path" + StringName + ">\r\n" );
        }
        SaveFile.open("w");
        SaveFile.write( SaveFileString );
    } else {
        SaveFile.open( "w" );
        SaveFile.write("<Path" + StringName + ">" + StringToSave + "</Path" + StringName + ">\r\n");
    }
    SaveFile.close();

}

//Gets a string from a given text file in the user roaming folder
//SaveFileName = String - Name of the text file | StringName = String - Name of the String
//Return = String ou null
function IV2getSavedString( SaveFileName , StringName ){

    //Finding the text file
    var SaveFile = new File( Folder.userData.fsName + "/" + SaveFileName + ".txt" );
    if( SaveFile.exists )
    {
        SaveFile.open( "r" );
        var SaveFileString = SaveFile.read();
        SaveFile.close();
    } else {
        return "" ;
    }

    //Getting the String
    var StringNameIndex = SaveFileString.search( StringName );
    if( StringNameIndex != -1 )
    {
        var StringStartIndex = StringNameIndex + StringName.length + 1 ;
        var StringEndIndex = SaveFileString.search( "</Path" + StringName + ">" );
        var String = SaveFileString.slice( StringStartIndex , StringEndIndex );
        return String ;
    } else {
        return "" ;
    }

}