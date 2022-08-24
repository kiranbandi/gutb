import React, { useEffect, useRef, useState } from "react"
import './Miniview.css'
import { scaleLinear } from "d3-scale"
import { useDispatch, useSelector } from "react-redux"
import Window from "./Window"

import { addMiniview, moveMiniview, selectMiniviews, updateData, changeMiniviewColor, changeMiniviewVisibility } from "./miniviewSlice"


const Miniview = ({ array, color, doSomething, coordinateX, coordinateY, width, height, absolutePositioning, displayPreview, id, beginning, fin, preview, boxLeft, boxTop, boxWidth, ...props }) => {

    const canvasRef = useRef()

    // TODO Not a huge fan of using this here
    const previewSelector = useSelector(selectMiniviews)['preview']

    useEffect(() => {

        if (array !== undefined) {

            let cap;
            fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

            let start;
            beginning ? start = beginning : start = Math.min(...array.map(d => d.start))

            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


            let xScale = scaleLinear().domain([start, cap]).range([0, ctx.canvas.width])
            let widthScale = scaleLinear().domain([0, cap - start]).range([0, ctx.canvas.width])
            ctx.fillStyle = 'hsl(' + color + ', 70%, 50%)'


            array.forEach(gene => {
                let x = xScale(gene.start)
                let rectWidth = widthScale(gene.end - gene.start)
                ctx.beginPath()
                ctx.rect(x, 0, rectWidth, ctx.canvas.height)
                ctx.fill()
            })
        }

    }, [array, color])

    let position = absolutePositioning ? 'absolute' : 'relative'

    let style = {
        position: position,
        top: coordinateY,
        left: coordinateX,
        width: width,
        height: height,
        margin: 0
    }

    // TODO -> does this need to be here?
    const dispatch = useDispatch()

    function showPreview(event) {

        if (displayPreview) {

            let boundingBox = event.target.getBoundingClientRect()
            let verticalScroll = document.documentElement.scrollTop


            let westEnd = boundingBox.x
            let eastEnd = boundingBox.x + boundingBox.width
            
            
            let coordinateX = event.pageX
            let coordinateY = boundingBox.y + boundingBox.height + 5 + verticalScroll


            // Would give weird scaling if the array was movable
           let cap;
            fin ? cap = fin : cap = Math.max(...array.map(d => d.end))

            let start;
            beginning ? start = beginning : start = Math.min(...array.map(d => d.start))


            let xScale = scaleLinear().domain([start, cap]).range([westEnd, eastEnd])
            let widthScale = scaleLinear().domain([start,cap]).range([0, eastEnd-westEnd])

            let center = xScale.invert(coordinateX)
            let head = center - 50000
            let end = center + 50000

            let previewArray = array.filter(item => {
                return ((item.end >= head && item.start <= head) || (item.start >= head && item.end <= end) || (item.start <= end && item.end >= end))
            })

            // TODO these are placeholders + hacky fixes
            if (!preview) {
                dispatch(changeMiniviewColor({
                    key: 'preview',
                    color: color
                }))
                dispatch(updateData({
                    key: 'preview',
                    array: previewArray,
                    start: head,
                    end: end,
                    boxWidth: widthScale(end - head),
                }))
                dispatch(moveMiniview(
                    {
                        key: 'preview',
                        coordinateX: Math.max(westEnd, Math.min(eastEnd - previewSelector.width, coordinateX - previewSelector.width / 2)),
                        coordinateY: coordinateY,
                    }))
                dispatch(changeMiniviewVisibility(
                    {
                        key: 'preview',
                        visible: true
                    }))

            }
        }
    }

    return (
        <>
            {preview && <Window
                className={"comparison"}
                coordinateX={boxLeft}
                coordinateY={boxTop}
                width={boxWidth}
                preview={id == 'preview' ? false : true}
                text={Math.round(beginning)}
            />}
            <canvas
                id={id}
                ref={canvasRef}
                className='miniview'
                width='2000'
                height='1000'
                style={style}
                onClick={doSomething}
                onMouseMove={(e) => showPreview(e)}
                onMouseLeave={() => dispatch(
                    changeMiniviewVisibility({
                        key: 'preview',
                        visible: false
                    })
                )}
                {...props} />
        </>
    )
}

Miniview.defaultProps = {
    color: 0,
    coordinateX: 0,
    coordinateY: 0,
    width: '100%',
    height: '100%',
    absolutePositioning: false,
    displayPreview: true,
}


export default Miniview
