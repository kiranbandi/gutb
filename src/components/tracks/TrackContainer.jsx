
import { nanoid } from '@reduxjs/toolkit'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash';

import { selectComplicatedTracks, appendComplicatedTrack } from './complicatedTrackSlice'
import BasicTrack from './BasicTrack'
import TestImage from './ImageTrack'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { set } from 'lodash'
import { changePreviewVisibility, selectMiniviews, movePreview } from '../../features/miniview/miniviewSlice';
import { scaleLinear } from 'd3-scale'
import StackedTrack from './StackedTrack';


import { selectGenome } from './genomeSlice'
import { Typography, Stack, Tooltip } from '@mui/material';
import TrackControls from './TrackControls'
import TrackScale from './track_components/TrackScale'
import { ContentPasteOffSharp, EditNotificationsOutlined } from '@mui/icons-material'


function indexTopixel(index, zoom,array, maxWidth){
  let pixel =  scaleLinear().domain([0, array.length]).range([0, maxWidth*zoom])
  return pixel(index)
}

function pixelToindex(pixel, zoom, array, maxWidth){
  let index =  scaleLinear().domain([0, maxWidth*zoom]).range([0, array.length])
  return index(pixel)

}

function TrackContainer({ array = [], trackType, id, subGenomes, color, isDark, zoom, offset, width, height, pastZoom, renderTrack, activeChromosome }) {

  //! This is intended to hold the different tracktypes. Use it to modify any information that needs
  //! to be passed from the slice to the track. In the return statement, check the "renderTrack" prop
  //! to return a given track type.

  const dispatch = useDispatch()
  const genomeSelector = useSelector(selectGenome)

  const [activeSubGenome, setActiveSubGenome] = useState("N/A")
  const [numChange, setNumChange] = useState(0)
  const [SGThreshold, setSGThreshold]  = useState()

  const trackRef = useRef()
  const [cap, setCap] = useState()
  const [numberOfImages, setNumberOfImages] = useState(0)

  const [dragging, setDragging] = useState(false)

  let suffix = isDark ? "track_dark" : "track"
  let orthologSuffix = isDark ? "_orthologs_dark" : "_orthologs"
  let image = 'files/track_images/' + id + suffix + ".png"
  let orthologImage = 'files/track_images/' + id + orthologSuffix + ".png"

  let imageBunch = 'files/track_images/' + id + suffix

  // Moved from imageTrack
  let maxWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60) * zoom
  let originalWidth = (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
  let adjustedHeight = (document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75)
  const previewSelector = useSelector(selectMiniviews)['newPreview']
  const [hoverStyle, setHoverStyle] = useState({ display: "none" })
  const [info, setInfo] = useState("")
  const [startOfTrack, setStartOfTrack] = useState()
  const [endCap, setEndCap] = useState()
  // const [activeSubGenome, setActiveSubGenome] =  useState("N/A")
  const [dataArray, setDataArray] = useState([...array])

  const updateActiveSubgenome = (SG) => {
    // console.log("YESSS"

    setActiveSubGenome(SG);

    // console.log(activeSubGenome)
  };

  const updateSGThreshold = (data) => {
    // console.log("YESSS"

    setSGThreshold(data);

    // console.log(activeSubGenome)
  };

  const positionRef = React.useRef({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef(null);


  useEffect(() => {
    setDataArray([...array])
    // console.log(array)

  }, [array])

  useEffect(() => {


    // console.log("offset", pixelToindex(offset, zoom, array, maxWidth), "zoom", zoom)
    // let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth])


    let scalingIncrements = scaleLinear().domain([0, array.length]).range([0, maxWidth])

    // console.log("ZOOM", zoom, "START", Math.max(0, scalingIncrements.invert(0 - offset)), "END", Math.min(array.length, scalingIncrements.invert(originalWidth - offset)))
    // setDataArray()
    if (renderTrack ==  "stackedTrack"){

      if (zoom == 1){
        setDataArray(array)
      }
  
      else{
        const requiredData = array.slice(Math.round(startOfTrack),  Math.round(endCap))
        const subgenomeSortedData = _.sortBy(requiredData, (d) => d[activeSubGenome]);
        setDataArray(subgenomeSortedData)
      }
      setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
    setEndCap(Math.min(array.length, scalingIncrements.invert(originalWidth - offset)))

    }

    else{
    setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
    setEndCap(Math.min(scalingIncrements.invert(originalWidth - offset), cap))
}


    

  }, [zoom, offset, cap])

  useEffect(()=>{
    const subgenomeSortedData = _.sortBy(dataArray, (d) => d[activeSubGenome]);


      setDataArray(subgenomeSortedData);
      setNumChange(numChange+1);
  },[activeSubGenome])
  
  useEffect(() => {

  },[SGThreshold])

  function handleScroll(e) {

    if (e.altKey == true) {
      setHoverStyle({ display: "none", pointerEvents: "none" })
      let factor = 0.8

      if (e.deltaY < 0) {
        factor = 1 / factor
      }

      // // Finding important markers of the track, since it's often in a container
      // let trackBoundingRectangle = e.target.getBoundingClientRect()
      // let padding = parseFloat(getComputedStyle(e.target).paddingLeft)

      // Finding the location of the mouse on the track, the rendered track is adjusted with css,
      // so the mouse location needs to be normalized to the canvas
      // if (renderTrack=="stackedTrack"){


      // }

      let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * originalWidth

      //  Needs to be panned so that the  location remains the same
      let dx = ((normalizedLocation - offset) * (factor - 1))

      let parentWrapperHeight = document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;

        const raw_width = parentWrapperWidth ? Math.round(parentWrapperWidth) : width;

      let offsetX = 0;
      if (renderTrack == "stackedTrack"){
         offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      }
      else{
       offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      }
      
      if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0


      dispatch(updateTrack({
        key: id,
        offset: offsetX,
        zoom: Math.max(zoom * factor, 1.0)
      }))
    }
  }


  function handlePan(e) {
    // Finding important markers of the track, since it's often in a container
    let trackBoundingRectangle = e.target.getBoundingClientRect()
    let padding = parseFloat(getComputedStyle(e.target).paddingLeft)
    setHoverStyle({ display: "none", pointerEvents: "none" })

    // Finding the offset
    let dx = e.movementX

    //  let offsetX = Math.max(Math.min(offset + dx, 0), -(maxWidth - originalWidth))


    if (renderTrack  == "stackedTrack"){
      if (startOfTrack == 0 && dx >0){
        return
      }
      if (endCap == array.length && dx<0){


        return
      }
    }
    let offsetX = offset + dx

    // Either end of the track
    let westEnd = trackBoundingRectangle.x
    let eastEnd = westEnd + maxWidth

    //! TODO Shouldn't be able to scroll passed the edges, made this possible for dealing with bitmaps

    dispatch(updateTrack({
      key: id,
      offset: offsetX,
      zoom: zoom
    }))
  }

  useEffect(() => {
    if (!cap) {
      let endBP = Math.max(...genomeSelector[id].array.map(d => d.end))
      setCap(endBP)
      setNumberOfImages(Math.ceil(endBP / 1000000))
    }
  }, [cap, isDark])

  function bunchOfTracks(currentZoom, currentOffset) {

    // Multiple images passed as a prop? TestImage renders them?
    // I will need to adjust offset in this component if that is going to be my way of doing that

    // Need to find the bp location


    let bunch = []

    // So the bounding client rect is always the same, so the offset will have to be used to
    // determine the location

    // Find the bp location, and use the number of images to
    // determine which to load.

    // The offset will have to be adjusted when passing the following images, but the bp location should
    // be able to be used to scale the offset... i.e. -3700 -> maxWidth == totalWidth / number of Images, etc etx

    // let imageScale = scaleLinear().domain([27 + offset, originalWidth]).range([0, numberOfImages])
    let imageScale = scaleLinear().domain([27 + currentOffset, maxWidth]).range([0, numberOfImages])
    let testImageScale = scaleLinear().domain([0, cap]).range([27, maxWidth])

    let firstImage = Math.floor(imageScale(0))



    let scaling = maxWidth / numberOfImages

    let adjustedOffset = offset + scaling * firstImage
    let adjustedZoom = currentZoom / numberOfImages

    let bpLocation = Math.round(testImageScale.invert(Math.abs(offset)))

    let correctImage = Math.floor(bpLocation / 1000000)

    let startOfImage = correctImage * 1000000



    let newImageScale = scaleLinear().domain([startOfImage, startOfImage + 1000000]).range([0, originalWidth * adjustedZoom])
    adjustedOffset = newImageScale(bpLocation)

    for (let x = 0; x < 2; x++) {
      let imageChoice = correctImage + x
      if (imageChoice > -1 && imageChoice < numberOfImages) {
        bunch.push(imageBunch + "_" + imageChoice + ".png")


      }
    }
    return (<TestImage
      image={bunch}
      orthologs={orthologImage}
      id={id}
      zoom={adjustedZoom}
      offset={-adjustedOffset}
      cap={cap}
      color={color}
    />
    )
  }

  function handleClick(e) {
    if (e.type == 'mousedown') {

      setDragging(true)
    }
    if (e.type == 'mouseup') {
      setDragging(false)
    }
  }


  function leaveTrack() {
    setHoverStyle({ display: "none" })
    setDragging(undefined)
    dispatch(changePreviewVisibility({
      visible: false
    }))
    // setCursorStyle({display: "none"})
  }

  function hover(e) {
    if (e.target.id.includes('ortholog')) {
      setHoverStyle({ display: "none" })
      return
    }
    if (renderTrack == "stackedTrack" && array.length!=0){
      let parentWrapperHeight = document.querySelector('.draggableItem')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggableItem')?.getBoundingClientRect()?.width;

        const raw_width = parentWrapperWidth ? Math.round(parentWrapperWidth) : width;



        let verticalScroll = document.documentElement.scrollTop
      let trackBoundingRectangle = trackRef.current.getBoundingClientRect()

      let adjustedPos = (e.clientX - trackBoundingRectangle.left)

      let xScale = scaleLinear().domain([0, dataArray.length]).range([0, raw_width-20])
      let widthScale = scaleLinear().domain([0, dataArray.length]).range([0, originalWidth])

      // console.log(adjustedPos)
      let bpPosition = xScale.invert(adjustedPos)
      // console.log(bpPosition)
      let num = Math.round(bpPosition)
      setInfo(`${JSON.stringify(dataArray[num])}\n}`)
      setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(num) + trackBoundingRectangle.left , width: width, top: trackBoundingRectangle.top + verticalScroll + 50, height: adjustedHeight, backgroundColor: "red" })
     return
    }

    let verticalScroll = document.documentElement.scrollTop
    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()

    let adjustedPos = (e.clientX - trackBoundingRectangle.left) - offset

    let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
    let widthScale = scaleLinear().domain([0, endCap - startOfTrack]).range([0, originalWidth])
    let bpPosition = xScale.invert(adjustedPos)

    if (!previewSelector.visible) {
      dispatch(changePreviewVisibility({
        visible: true
      }))
    }
    dispatch(movePreview({
      center: bpPosition
    })
    )

    for (let i = 0; i < array.length; i++) {
     
          if (bpPosition > array[i].start && bpPosition < array[i].end) {
            let width = widthScale(array[i].end - array[i].start)
        setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings : 'No Orthologs'}`)
        setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left + offset, width: width, top: trackBoundingRectangle.top + verticalScroll + 50, height: adjustedHeight, backgroundColor: "red" })

        return
      }
    }
    setHoverStyle({ display: "none", pointerEvents: "none" })
  }


  const handleTooltip = (event) => {
    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }
  };


  let cursorStyle = { display: "none", pointerEvents: "none" }


  if (previewSelector.visible && trackRef.current) {

    let trackBoundingRectangle = trackRef.current.getBoundingClientRect()
    let left = trackBoundingRectangle.x
    let top = trackBoundingRectangle.y + 50
    let yheight = height - 25
    let verticalScroll = document.documentElement.scrollTop
    let width = trackBoundingRectangle.width - 40

    let bpPosition = previewSelector.center

    let xScale = scaleLinear().domain([0, cap]).range([0, maxWidth])

    if (xScale(bpPosition) + left + offset < left + width) {
      let cursorColor = isDark ? "white" : "black"
      cursorStyle = { pointerEvents: "none", zIndex: 99, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: adjustedHeight, backgroundColor: cursorColor, opacity: 0.4 }
    }
  }

  return (
    <>
      <div style={cursorStyle}></div>
      <div style={hoverStyle}></div>

      <Tooltip
        title={info ? <Typography
          variant="caption"
          style={{ whiteSpace: 'pre-line' }}
        >
          {info}
        </Typography> : ''}
        arrow
        placement='top'
        PopperProps={{
          popperRef,
          anchorEl: {
            getBoundingClientRect: () => {
              return new DOMRect(
                positionRef.current.x,
                trackRef.current.getBoundingClientRect().y + 50,
                0,
                0,
              );
            },
          },
        }}
      >
        <div
          className={"parent"}
          // style={{pointerEvents: "none"}}
          ref={trackRef}
          onWheel={handleScroll}
          onMouseMove={(e) => {
            if (dragging) {
              handlePan(e)
            }
            else {
              hover(e)
              handleTooltip(e)

            }
          }
          }
          onMouseDown={(e) => handleClick(e)}
          onMouseUp={(e) => handleClick(e)}
          onMouseLeave={leaveTrack}
          onDragStart={(e) => e.preventDefault()}
        >

          {
          renderTrack ==  "stackedTrack"?
          <StackedTrack width={maxWidth}  height={adjustedHeight} activeSubGenome={activeSubGenome}  array={dataArray} subGenomes={subGenomes}></StackedTrack>
            :
          renderTrack == "bitmap" && (zoom > numberOfImages ?
            bunchOfTracks(zoom, offset)
            :
            <TestImage
              image={[image]}
              orthologs={orthologImage}
              id={id}
              zoom={zoom}
              offset={offset}
              cap={cap}
              color={color}
            />

          )}

        </div>
      </Tooltip>
      <TrackScale
        endOfTrack={endCap}
        startOfTrack={startOfTrack}
        width={originalWidth}
        paddingLeft={0}
        paddingRight={0} />
      <TrackControls id={id} height={adjustedHeight} gap={adjustedHeight + 25} updateSGThreshold={updateSGThreshold} activeSubGenome={activeSubGenome} subGenomes={subGenomes}  updateActiveSubgenome={updateActiveSubgenome} renderTrack={renderTrack}/>

    </>

  )
}

export default TrackContainer