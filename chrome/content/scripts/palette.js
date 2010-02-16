/**
 * Palette class. Maintains a colecction of swatches,
 * and provides options for operating on those swatches.
 */

function Palette(){
    this.swatches = new Array();
    this.selectedSwatches = new Array();
    
    this.swatchClusters = [];
    
    this.selectionObservers = [];

    /**
     * Returns the number of swatches in
     * this palette
     */
    this.size = function(){
        return this.swatches.length;
    }

    /**
     * Returns the number of selected swatches
     * in this palette
     */
    this.selectionSize = function(){
        return this.selectedSwatches.length;
    }
    
    /**
     * Returns the number of clusters of swatches in this palette
     */
    this.clusterCount = function(){
        return this.swatchClusters.length;
    }

    /**
     * Return the set of selecte swatches
     */
    this.getSelectedSwatches = function(){
        return this.selectedSwatches;
    }

    this.selectAllSwatches = function(){
        startSelectionNotificationBuffer();
        Array.forEach(this.swatches, function(swatch) {
            swatch.select();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Make no swatches selected
     */
    this.deselectAllSwatches = function(){
        startSelectionNotificationBuffer();
        this.swatches.forEach(function(swatch) {
            swatch.deselect();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Add a swatch to the selection
     */
    this.selectSwatch = function(swatch){
        if (!this.selectedSwatches.contains(swatch)){
            swatch.select();
        }
    }

    /**
     * Remove a swatch from the selection
     */
    this.deselectSwatch = function(swatch){
        swatch.deselect();
    }

    /**
     * Add a set of swatches to the selection
     */
    this.selectSwatches = function(swatchArray){
        startSelectionNotificationBuffer();
        Array.forEach(swatchArray, function(swatch) {
            swatch.select();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Remove a set of swatches from the selection
     */
    this.deselectSwatches = function(swatchArray){
        startSelectionNotificationBuffer();
        Array.forEach(swatchArray, function(swatch) {
            swatch.deselect();
        });
        flushSelectionNotificationBuffer();
    }

    /**
     * Select a range of swatches between swatchA and swatchB
     */
    this.selectSwatchRange = function(swatchA, swatchB){
        if(!this.swatches.contains(swatchA) || !this.swatches.contains(swatchB)){
            return;
        }
        //Find the start and end of the range
        var startIndex = Math.min(
                this.swatches.indexOf(swatchA),
                this.swatches.indexOf(swatchB));
        var endIndex = Math.max(
                this.swatches.indexOf(swatchA),
                this.swatches.indexOf(swatchB));

        startSelectionNotificationBuffer();
        //Select all swatches in the range
        for(var i = startIndex; i <= endIndex; i++){
            this.swatches[i].select();
        }
        flushSelectionNotificationBuffer();
    }
    
    /**
     * Select swatches similar in color to the given swatch.
     */
    this.selectSimilar = function(referenceSwatch){
        startSelectionNotificationBuffer();
        
        var clusterToSelect = null
        var clusterNumber = 0;
        while (clusterToSelect == null && clusterNumber < this.clusters.length){
            if (this.clusters[clusterNumber].contains(referenceSwatch)) {
                clusterToSelect = this.clusters[clusterNumber];
            }
            clusterNumber++;
        }
        if (clusterToSelect != null){
            this.deselectAllSwatches();
            this.selectSwatches(clusterToSelect);
        }
        
        /*
        //Higher numbers cause less similar swatches to be included in
        //the selection. Lower numbers cause only very similar swatches
        //to be included in the selection.
        var similarityThreshold = 150;
        
        var distances = [];
        Array.forEach(this.swatches, function(swatch) {
            swatch.deselect();
            distances.push(
                [referenceSwatch.color.HCLDistanceFrom(swatch.color),
                swatch]
            );
        });
        
        //Sort by distances
        distances.sort(function(a, b){
            return (a[0] - b[0])
        });
        
        var count = this.swatches.length;
        
        var index = 0;
        while (index <= count && distances[index][0] < similarityThreshold){
            distances[index][1].select();
            index++;
        }
        */
        flushSelectionNotificationBuffer();
    }
    
    this.cluster = function (){
        var start = new Date().getMilliseconds();
        
        //Distances above which we should not merge
        var distanceThreshold = 150;
        
        this.clusters = new Array(this.swatches.length);
        
        var thisPalette = this;
        
        //Initialize all clusters as one-swatch clusters
        for(var i = 0; i < this.swatches.length; i++){
            this.clusters[i] = new Array(this.swatches[i]);
        }
        
        var distances = new Array(this.swatches.length);
        
        //Create a triangular array of all distance measurements between
        //color swatches. This array will be like
        //    [0][1][2][3][4]
        // [0] N
        // [1] 4  N
        // [2] 3  6  N
        // [3] 1  3  3  N
        // [4] 5  6  4  1  N
        //
        // Where each intersection between a row and column gives the
        // distance measurement between the two indexed swatches.
        for(var row = 0; row < this.swatches.length; row++) {
            distances[row] = new Array(row+1);
            //Fill the current row with distance measures.
            for (var col = 0; col <= row; col++){
                if (row == col){
                    //Don't measure distance from a swatch to itself
                    distances[row][col] = null;
                }
                else {
                    distances[row][col] =
                        this.swatches[row].color.HCLDistanceFrom(this.swatches[col].color);
                }
            }
        }
        
        //Find the distance between clusterA and clusterB in the
        //distances array
        function distance(clusterA, clusterB){
            return distances[Math.max(clusterA, clusterB)][Math.min(clusterA, clusterB)];
        }
        
        //Figure out which value will "win" the merge - the distance
        //between clusterA and referenceCluster, or the distance
        //between clusterB and referenceCluster. Null will always
        //win. In absense of a null, the greater distance will win.
        //Return the winning value.
        function winningValue(clusterA, clusterB, referenceCluster){
            var aVal = distance(clusterA, referenceCluster);
            var bVal = distance(clusterB, referenceCluster);
            return ((aVal == null || bVal == null) ? null : Math.max(aVal,bVal));
        }
        
        //Assign newValue as the new distance between clusterA and
        //clusterB in the distances table
        function assignDistance(clusterA, clusterB, newValue){
            distances[Math.max(clusterA, clusterB)][Math.min(clusterA, clusterB)] = newValue;
        }
        
        //Modify the distances array so that clusterA, refCluster
        //and clusterB, refCluster both reflect the new merged value
        function mergeValues(clusterA, clusterB, refCluster){
            var newVal = winningValue(clusterA, clusterB, refCluster);
            assignDistance(clusterA, refCluster, newVal);
            assignDistance(clusterB, refCluster, newVal);
        }
        
        //Return the pair of clusters that has the minimum distance
        //in the distance array. Returns an array in the form
        // [clusterA, clusterB, distance]
        function getPairWithMinDistance(){
            var minDistance = Infinity;
            var mergeRow = -1;
            var mergeCol = -1;
            for(var row = 0; row < distances.length; row++) {
                for (var col = 0; col < row; col++){
                    if (distances[row][col] < minDistance){
                        minDistance = distances[row][col];
                        mergeRow = row;
                        mergeCol = col;
                    }
                }
            }
            return [mergeRow, mergeCol, minDistance];
        }
        
        // Remove a cluster from the distances table in both dimensions
        // So removeFromDistances(3) would turn
        //    [0][1][2][3][4]
        // [0] N
        // [1] 4  N
        // [2] 3  6  N
        // [3] 1  3  3  N
        // [4] 5  6  4  1  N
        //
        // Into
        //    [0][1][2][3]
        // [0] N
        // [1] 4  N
        // [2] 3  6  N
        // [3] 5  6  4  N
        //
        // Also removes the cluster from the clusters array.
        function removeCluster(clusterNumber){
            var newDistances = new Array(distances.length-1);
            var newClusters = new Array(thisPalette.clusters.length-1);
            
            //Index map will be a map that skips the index
            //we are removing. For instance, if clusterNumber is 2,
            //we get 0->0, 1->1, 2->3, 3->4
            var indexMap = new Array(distances.length-1);
            for (var i = 0; i < indexMap.length; i++){
                indexMap[i] = ((i < clusterNumber) ? (i) : (i + 1));
                
                //Build the new clusters array as we build the index
                //map
                newClusters[i] = thisPalette.clusters[indexMap[i]];
            }
            
            //Build the new array, skipping clusterNumber
            for (var row = 0; row < newDistances.length; row++){
                newDistances[row] = new Array(row+1)
                for(var col = 0; col <= row; col++){
                    newDistances[row][col] =
                        distances[indexMap[row]][indexMap[col]];
                }
            }
            
            distances = newDistances;
            thisPalette.clusters = newClusters;
        }
        
        //Find the initial potential merge, getting the pair and
        //distance between them.
        var potentialMergePair = getPairWithMinDistance();
        var minDistance = potentialMergePair[2];
        
        while (minDistance <= distanceThreshold){
            //Figure out which cluster is getting merged into (targetCLuster)
            //and which is getting merged and removed (mergeCluster)
            var targetCluster =
                Math.min(potentialMergePair[0], potentialMergePair[1]);
            var mergeCluster =
                Math.max(potentialMergePair[0], potentialMergePair[1]);
            
            //Recalculate all the values in the distances array
            //based on the new merged clusters
            for (var refCluster = 0; refCluster < this.clusters.length; refCluster++){
                mergeValues(mergeCluster, targetCluster, refCluster);
            }
            
            //Concatenate the clusters
            this.clusters[targetCluster] =
                this.clusters[targetCluster].concat(this.clusters[mergeCluster]);
            
            removeCluster(mergeCluster);
            
            //Get the values for the next iteration
            potentialMergePair = getPairWithMinDistance();
            minDistance = potentialMergePair[2];
        }
        
        var end = new Date().getMilliseconds();
        
        dump("CLUSTER took " + (end - start)/1000 + " seconds\n");
    }
    
    this.sortByHueAndLightness = function(){
        this.swatches.sort(Swatch.compareHueAndLightness);
    }
    
    this.sortByClusters = function(){
        this.cluster();
        var sortedSwatches = [];
        for (var i = 0; i < this.clusters.length; i++){
            sortedSwatches = sortedSwatches.concat(this.clusters[i]);
        }
        this.swatches = sortedSwatches;
    }
    
    /**
     * Undo the most recently done action on this palette that
     * hasn't already been undone.*/
    this.undo = function(){
        if (this.canUndo()){
            undoList.top().undo();
            redoList.push(undoList.pop());
            notifyHistoryObservers();
        }
    }

    /**
     * Redo the most recently undone action
     **/
    this.redo = function(){
        if (this.canRedo()){
            redoList.top().redo();
            undoList.push(redoList.pop());
            notifyHistoryObservers();
        }
    }

    /**
     * Lets us know if this palette has any undo states.
     */
    this.canUndo = function(){
       return (undoList.length > 0);
    }

    /**
     * Lets us know if this palette has any redo states
     */
    this.canRedo = function(){
        return (redoList.length > 0);
    }

    /**
     * Update this palette with a swatch's state
     */
    this.updateSelection = function(swatch){
        if (swatch.isSelected()){
            if(!this.selectedSwatches.contains(swatch)){
                this.selectedSwatches.push(swatch);
                this.mostRecentlySelectedSwatch = swatch;
            }
        }
        else{
            this.selectedSwatches.remove(swatch);
        }
        this.notifySelectionObservers();
    }

    this.updateSwatchSetColor = function(swatch){
        undoList.push(swatch);

        //Clear the redo list - this wasn't an undone
        //command
        redoList = new Array();
        this.sortByClusters();
        notifyHistoryObservers();
    }

    /**
     * Insert a color property into the pallete,
     * inserting into an existing swatch if one
     * exists with an equivalent color, or creating
     * a new swatch if no swatch with the equivalent
     * color exists in this palette.
     *
     * Params:
     * property   A colorProperty to be inserted
     */
    this.insertProperty = function(property) {
        var foundInPalette = false;
        var i = 0;
        var color = property.getColor();

        //Look for an existing swatch with the same color
        while(i < this.swatches.length && !foundInPalette){
            foundInPalette = color.equals(this.swatches[i].color);
            i++;
        }

        //Insert into existing swatch
        if (foundInPalette){
            this.swatches[i-1].addProperty(property);
        }

        //Create new swatch
        else {
            var newSwatch = new Swatch(color, null, this);
            newSwatch.addProperty(property);

            //We want to be notified of selection
            //changes to this swatch
            newSwatch.addSelectionObserver(this);

            newSwatch.addSetColorObserver(this);
            this.swatches.push(newSwatch);
        }
    }

    /**
     * Insert all applicable properties from a rule into the palette,
     * using existing swatches where the swatch matches the color of
     * the color property from the style being inserted. That is, the
     * properties from the given rule will be consolidated into this
     * palette.
     *
     * The argument to this function is a DOM cssRule.
     */
    this.insertRule = function(rule) {
        //Don't process a null rule
        if(!rule){
            return;
        }
        
        var palette    = this;
        var properties = [
            'color',
            'background-color',
            'border-top-color',
            'border-bottom-color',
            'border-right-color',
            'border-left-color'
        ];

        //A particular rule may have 0 to 6 color properties defined
        //in it (the properties listed above). We want to be able to
        //access each of these separately. Thus we create a new
        //"ColorProperty" object for each of the above properties that
        //is set in "rule". EG if this particular rule sets "color"
        //and "background-color", we want to insert a new ColorProperty
        //object for each of those.
        
        //Loop through, seeing if each property needs to be created
        properties.forEach( function(property) {
            //If the property is set
            if (rule.style.getPropertyValue(property)) {
                palette.insertProperty(
                    new ColorProperty(rule, property)
                );
            }
        });
    }

    /* Add an observer that will be notified when
     * the selection on this palette changes
     */
    this.addSelectionObserver = function(observer){
        this.selectionObservers.push(observer);
    }

    this.removeSelectionObserver = function(observer){
        this.selectionObservers.remove(observer);
    }


    /* Notify all selection observers of a change
     * to this palette's selection set
     */
    this.notifySelectionObservers = function(){
        if(!selectionNotificationsBuffered){
            for(var i = 0; i < this.selectionObservers.length; i++){
                this.selectionObservers[i].updatePaletteSelection(this);
            }
        }
    }

    /* Add an observer that will be notified when
     * the palette's history is modified
     */
    this.addHistoryObserver = function (observer) {
        historyObservers.push(observer);
    }

    this.removeHistoryObserver = function(observer){
        historyObservers.remove(observer);
    }


    /* Notify all selection observers of a change
     * to this palette's selection set
     */
    this.notifySelectionObservers = function(){
        if(!selectionNotificationsBuffered){
            for(var i = 0; i < this.selectionObservers.length; i++){
                this.selectionObservers[i].updatePaletteSelection(this);
            }
        }
    }


    var thisPalette = this;

    /**
     * Notify all registered observers that the palette's history
     * has changed.
     */
    function notifyHistoryObservers(){
        for(var i = 0; i < historyObservers.length; i++){
            historyObservers[i].updatePaletteHistory(thisPalette);
        }
    }

    var historyObservers = [];

    var undoList = [];
    var redoList = [];

    /**
     * When we change lots of swatch selections at once, we don't
     * want to issue notifications individually. Thus we only notify
     * at the end. We use this "buffering" to accomplish that.
     * No, it's not actually buffering. Come up with a better name,
     * why don't you.
     */
    var selectionNotificationsBuffered = false;
    function startSelectionNotificationBuffer(){
        selectionNotificationsBuffered = true;
    }
    function flushSelectionNotificationBuffer(){
        selectionNotificationsBuffered = false;
        thisPalette.notifySelectionObservers();
    }
}

