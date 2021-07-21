import * as d3 from "https://cdn.skypack.dev/d3@7";

document.addEventListener('DOMContentLoaded', () => {
  const request = new XMLHttpRequest()
  const url = './json/global-temperature.json'

  request.onload = () => {
    const response = JSON.parse(request.response)
    const baseTemp = response.baseTemperature
    const data = response.monthlyVariance

    const w = 1600
    const h = 500

    const paddingX = {
      left: 60,
      right: 20
    }
    const paddingY = {
      top: 20,
      bottom: 100
    }

    const parseYear = d3.timeParse('%Y')
    const rangeYear = d3.extent(data, d => d.year)

    const xScale = d3.scaleTime()
      .domain(rangeYear.map(d => parseYear(d)))
      .range([paddingX.left, w - paddingX.right])

    const uniqueMonthValues = new Set(data.map(d => d.month))
    const yDomain = Array.from(uniqueMonthValues)
    yDomain.reverse()

    const yScale = d3.scaleBand()
      .domain(yDomain)
      .range([h - paddingY.bottom, paddingY.top])

    const rectWidth = (w - paddingX.left - paddingX.right) / (rangeYear[1] - rangeYear[0])
    const rectHeight = (h - paddingY.top - paddingY.bottom) / 12

    const tempRange = d3.extent(data, d => d.variance)

    const svg = d3.select('.outer-container')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

    const colorInter = d3.interpolateDiscrete(
      d3.quantize(d3.interpolateRgbBasis([
        '#1f6ab5',
        '#4269f5',
        '#badeff',
        '#8dd6f7',
        '#fffca3',
        '#fcd25d',
        '#f58758',
        '#b5400e',
        '#802e0b']),
      16)
    )

    const tempScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.variance))

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', d => xScale(parseYear(d.year)))
        .attr('y', d => yScale(d.month))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', d => colorInter(tempScale(d.variance)))

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(10))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(t => d3.timeFormat('%B')(new Date(t + '-1-2000')))

    svg.append('g')
      .attr('transform', 'translate(0, ' + (h - paddingY.bottom) + ')')
      .call(xAxis)

    svg.append('g')
      .attr('transform', 'translate(' + paddingX.left + ', 0)')
      .call(yAxis)

  }
  request.open('GET', url, true)
  request.send()
})
