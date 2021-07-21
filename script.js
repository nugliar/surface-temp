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
      top: 60,
      bottom: 20
    }

    const rangeYear = d3.extent(data, d => parseInt(d.year))

    const xScale = d3.scaleLinear()
      .domain(rangeYear)
      .range([paddingX.left, w - paddingX.right])

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([h - paddingY.top, paddingY.bottom])

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
        .attr('x', d => xScale(parseInt(d.year)))
        .attr('y', d => yScale(d.month))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', d => colorInter(tempScale(d.variance)))

    const xAxis = d3.axisBottom()
    const yAxis = d3.axisLeft()

    svg.append('g')
      .attr('transform', 'translate(0, ' + (h - paddingY.bottom) + ')')
      .call(xScale)

    svg.append('g')
      .attr('transform', 'translate(' + paddingX.left + ', 0)')
      .call(yScale)

  }
  request.open('GET', url, true)
  request.send()
})
