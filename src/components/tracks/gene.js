


export class gene{
    constructor(geneInfo, colour) {
        this.start = geneInfo.start;
        this.end = geneInfo.end;
        this.chromosome = geneInfo.chromosome;
        this.key = geneInfo.key;
        this.color = colour
        this.hover = false
        this.siblings = geneInfo.siblings
        //! Just for finding/testing
        if(this.siblings != undefined && this.siblings.length > 0){
            this.color += 20
        }
    }

    create(context, coordinateX, coordinateY, width, height){
        this.coordinateX = coordinateX
        this.coordinateY = coordinateY
        this.width = width
        this.height = height
        context.fillStyle = 'hsl(' + this.color + ', 70%, 50%)'
        context.beginPath()
        context.rect(coordinateX, coordinateY, width, height)
        context.fill()
    }

    update(context, coordinateX, coordinateY, width, height, lightness){
        this.coordinateX = coordinateX
        this.coordinateY = coordinateY
        this.width = width
        this.height = height
        context.fillStyle = 'hsl(' + this.color + ', 70%, ' + lightness +'%)'
        context.beginPath()
        context.rect(coordinateX, coordinateY, width, height)
        context.fill()
    }

    hovering(mouseX){
        if(mouseX >= this.coordinateX && mouseX <= this.coordinateX + this.width){
                this.lightness = 0
                return true
             }
             else{
                 this.lightness = 50
                 return false
             }
    }

}