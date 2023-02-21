
import { nanoid } from '@reduxjs/toolkit'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectComplicatedTracks, appendComplicatedTrack } from './complicatedTrackSlice'
import RenderTrack from './RenderTrack'
import ImageTrack from './ImageTrack'
import { selectBasicTracks, updateTrack } from './basicTrackSlice'
import { set } from 'lodash'
import { changePreviewVisibility, selectMiniviews, movePreview } from '../../features/miniview/miniviewSlice';
import { scaleLinear } from 'd3-scale'
import { selectGenome } from './genomeSlice'
import { Typography, Stack, Tooltip } from '@mui/material';
import TrackControls from './TrackControls'
import TrackScale from './track_components/TrackScale'

function TrackContainer({ array, trackType, id, color, isDark, zoom, offset, width, cap, height, pastZoom, normalize, normalizedLength, renderTrack, genome }) {

  //! This is intended to hold the different tracktypes. Use it to modify any information that needs
  //! to be passed from the slice to the track. In the return statement, check the "renderTrack" prop
  //! to return a given track type. The scale and track buttons are rendered by this container,
  //! if you'd like them removed feel free to add a conditional, if you want them, there shouldn't be 
  //! any extra that needs to be done.

  //! This is also still in the process of refactoring - for example, the gt still needs to be added

  const dispatch = useDispatch()
  const genomeSelector = useSelector(selectGenome)

  const trackRef = useRef()
  // const [cap, setCap] = useState()
  const [numberOfImages, setNumberOfImages] = useState(0)

  const [dragging, setDragging] = useState(false)

  let suffix = isDark ? "track_dark" : "track"
  let orthologSuffix = isDark ? "_orthologs_dark" : "_orthologs"
  let image = 'files/track_images/' + id + suffix + ".png"
  let orthologImage = 'files/track_images/' + id + orthologSuffix + ".png"
  let imageBunch = 'files/track_images/' + id + suffix
  // Moved from imageTrack
  let originalWidth = width ? width : (document.querySelector('.draggable')?.getBoundingClientRect()?.width - 60)
  let maxWidth = originalWidth * zoom
  let adjustedHeight = genome ? 50 : (document.querySelector('.draggable')?.getBoundingClientRect()?.height - 75)
  const previewSelector = useSelector(selectMiniviews)['newPreview']
  const [hoverStyle, setHoverStyle] = useState({ display: "none" })
  const [info, setInfo] = useState("")
  const [startOfTrack, setStartOfTrack] = useState()
  const [endCap, setEndCap] = useState()
  const [ renderOrthologs, setRenderOrthologs ] = useState()


  let imageExists = () => {
    if(renderOrthologs !== undefined) return
    const img = new Image()
    img.onload = () => setRenderOrthologs(true)
    img.onerror = () => setRenderOrthologs(false)
    img.src = orthologImage
    img.remove()
}


  const positionRef = React.useRef({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef(null);


  useEffect(() => {
  }, [isDark])
  useEffect(() => {
    let endBP = Math.max(...genomeSelector[id].array.map(d => d.end))
    // setCap(endBP)
    setNumberOfImages(Math.ceil(endBP / 1000000))
    let scalingIncrements = scaleLinear().domain([0, cap]).range([0, maxWidth])
    setStartOfTrack(Math.max(0, scalingIncrements.invert(0 - offset)))
    setEndCap(Math.min(scalingIncrements.invert(originalWidth - offset), cap))
    imageExists()
  }, [zoom, offset, cap, array])

  function handleScroll(e) {
    if(genome) return
    if (e.altKey == true) {
      setHoverStyle({ display: "none", pointerEvents: "none" })
      let factor = 0.8

      if (e.deltaY < 0) {
        factor = 1 / factor
      }

      // Finding the location of the mouse on the track, the rendered track is adjusted with css,
      // so the mouse location needs to be normalized to the canvas
      let normalizedLocation = ((e.clientX - e.target.offsetLeft) / e.target.offsetWidth) * originalWidth

      //  Needs to be panned so that the zoom location remains the same
      let dx = ((normalizedLocation - offset) * (factor - 1))
      let offsetX = Math.max(Math.min(offset - dx, 0), -((maxWidth * factor) - originalWidth))
      if (Math.max(zoom * factor, 1.0) === 1.0) offsetX = 0
      dispatch(updateTrack({
        key: id,
        offset: offsetX,
        zoom: Math.max(zoom * factor, 1.0)
      }))
    }
  }


  function handlePan(e) {
    if(genome) return
    // Finding important markers of the track, since it's often in a container
    let trackBoundingRectangle = e.target.getBoundingClientRect()
    let padding = parseFloat(getComputedStyle(e.target).paddingLeft)
    setHoverStyle({ display: "none", pointerEvents: "none" })

    // Finding the offset
    let dx = e.movementX

     let offsetX = Math.max(Math.min(offset + dx, 0), -(maxWidth - originalWidth))
    // let offsetX = offset + dx

    // Either end of the track
    let westEnd = trackBoundingRectangle.x
    let eastEnd = westEnd + maxWidth

    dispatch(updateTrack({
      key: id,
      offset: offsetX,
      zoom: zoom
    }))
  }




  function bunchOfTracks(currentZoom, currentOffset) {

    // Used to determine which images to pass as a prop to imageTracks, as well as to adjust the offset/zoom
    // once those multiple images are sent.


    let bunch = []

    // let imageScale = scaleLinear().domain([currentOffset, maxWidth]).range([0, numberOfImages])
    //! Gotta be a combination of these
    let currentImageScale = scaleLinear().domain([0, cap]).range([0, maxWidth])
    // let firstImage = Math.floor(imageScale(0))
    //! As zoom increases - it gets closer to the correct location, when first transitioning,
    //! it's pretty far off
    // let scaling = maxWidth / numberOfImages

    // let adjustedOffset = offset + scaling * firstImage
    // ! This is correct
    let ratio = cap/1000000
    let adjustedZoom = currentZoom / ratio

    //! It's gotta be this, right? - I THINK this is right as well
    let bpLocation = Math.round(currentImageScale.invert(Math.abs(offset)))
    // console.log(`The base pair location : ${bpLocation}`)

    // ! These two are for sure right
    let correctImage = Math.floor(bpLocation / 1000000)
    let startOfImage = correctImage * 1000001

    // console.log(`Startofimage = ${startOfImage}`)
    //! or this? So it has to be this
    let newImageScale = scaleLinear().domain([startOfImage, startOfImage + 1000000]).range([0, originalWidth * adjustedZoom])
    let adjustedOffset = newImageScale(bpLocation)

    // As each image is 1000000 pixels wide, no more than two will ever be needed
    for (let x = 0; x < 2; x++) {
      let imageChoice = correctImage + x
      if (imageChoice > -1 && imageChoice < numberOfImages) {
        bunch.push(imageBunch + "_" + imageChoice + ".png")
      }
    }
    return (<ImageTrack
      image={bunch}
      orthologs={renderOrthologs ? orthologImage : renderOrthologs}
      genome={genome}
      id={id}
      zoom={adjustedZoom}
      offset={-adjustedOffset}
      cap={cap}
      color={color}
      normalize={genome ? false : normalize}
      normalizedLength={normalizedLength}
      width={width}
    />
    )
  }

  function handleClick(e) {
    if(genome) return
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
    if(genome) return
    if (e.target.id.includes('ortholog')) {
      setHoverStyle({ display: "none" })
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
        if(renderTrack == "bitmap"){
          setInfo(`${array[i].key.toUpperCase()}\nStart Location: ${array[i].start}\nOrthologs: ${array[i].siblings.length > 0 ? array[i].siblings : 'No Orthologs'}`)
          setHoverStyle({ pointerEvents: "none", zIndex: 2, position: "absolute", left: xScale(array[i].start) + trackBoundingRectangle.left + offset, width: width, top: renderOrthologs ? trackBoundingRectangle.top + verticalScroll + 50 : trackBoundingRectangle.top + verticalScroll + 25, height: renderOrthologs ? adjustedHeight : adjustedHeight + 25, backgroundColor: "red" })
        }
        // console.log(info)
        return
      }
    }
    setHoverStyle({ display: "none", pointerEvents: "none" })
    setInfo("")
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
    let top = trackBoundingRectangle.y + 27
    let yheight = height - 25
    let verticalScroll = document.documentElement.scrollTop
    let width = trackBoundingRectangle.width - 40

    let bpPosition = previewSelector.center

    let xScale = normalize ? scaleLinear().domain([0, normalizedLength]).range([0, maxWidth]) : scaleLinear().domain([0, cap]).range([0, maxWidth])

    if (xScale(bpPosition) + left + offset < trackRef.current.offsetLeft + maxWidth) {
      let cursorColor = isDark ? "white" : "black"
      if (genome){
        cursorStyle = { pointerEvents: "none", zIndex: 99, borderLeft: "5px solid transparent",  borderRight: "5px solid transparent",  borderTop: "5px solid transparent", borderBottom: `5px solid ${cursorColor}` ,position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24, }
      }
      else{
        cursorStyle = { pointerEvents: "none", zIndex: 99, position: "absolute", left: xScale(bpPosition) + left + offset - 2, width: 4, top: top + verticalScroll, height: genome ? adjustedHeight : adjustedHeight + 24, backgroundColor: cursorColor, opacity: 0.4 }
      }
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
          id={id}
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
          style={{marginLeft: "10px"}}
        >

          {renderTrack == "bitmap" && 
          ((zoom > numberOfImages && numberOfImages > 0) ?
            bunchOfTracks(zoom, offset)
            :
            <ImageTrack
              image={[image]}
              orthologs={renderOrthologs ? orthologImage : renderOrthologs}
              genome={genome}
              id={id}
              zoom={zoom}
              offset={offset}
              cap={cap}
              color={color}
              normalize={genome ? false : normalize}
              height={genome ? height - 25 : undefined}
              normalizedLength={normalizedLength}
              width={width}
            />
          ) ||
          renderTrack == "basic" && 
          <RenderTrack
                title={id}
                key={id}
                id={id}
                array={array}
                color={color}
                isDark={isDark}
                offset={offset}
                zoom={zoom}
                pastZoom={pastZoom}
                height={1}
                trackType={trackType}
                normalize={genome ? false : normalize}
                normalizedLength={normalizedLength}
                width={genome ? width : undefined}
          />
          }

    {!genome && <TrackScale
        endOfTrack={normalize? normalizedLength : endCap}
        startOfTrack={startOfTrack}
        width={originalWidth}
        paddingLeft={0}
        paddingRight={0} />}
        {!genome &&
      <TrackControls id={id} height={adjustedHeight} gap={adjustedHeight + 25} />}
        </div>
      </Tooltip>

    </>

  )
}

export default TrackContainer