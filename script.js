import * as d3 from "https://cdn.skypack.dev/d3@7";

document.addEventListener('DOMContentLoaded', () => {
  const request = new XMLHttpRequest()
  const url = './json/global-temperature.json'

  request.onload = () => {
    const response = JSON.parse(request.response)
    const baseTemp = response.baseTemperature
    const data = response.monthlyVariance

    const description = document.getElementById('description')
    description.textContent = '1753 - 2015: base temperature ' + response.baseTemperature + '℃'

    const w = 1600
    const h = 500

    document.getElementById('root').style.width = w + 100 + 'px'

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

    const tempRange = d3.extent(data, d => baseTemp + d.variance)

    const svg = d3.select('.outer-container')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

    const colorQuants = d3.quantize(d3.interpolateRgbBasis([
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

    const colorInter = d3.interpolateDiscrete(colorQuants)

    const tempScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.variance))

    const tooltip = d3.select('.outer-container')
      .append('div')
      .attr('id', 'tooltip')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
        .attr('class', 'cell')
        .attr('data-month', d => d.month - '1')
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.variance)
        .attr('x', d => xScale(parseYear(d.year)))
        .attr('y', d => yScale(d.month))
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', d => colorInter(tempScale(d.variance)))
        .on('mouseover', (e, d) => {
          const temp = d3.format('.1f')(baseTemp + d.variance)
          const variance = d3.format('.1f')(d.variance)
          const period = d.year + ' - ' + d3.timeFormat('%B')(new Date(
            (parseInt(e.target.attributes['data-month'].value) + 1) + '-1-2000')
          )

          e.preventDefault()

          tooltip.transition()
            .duration(200)
            .style('opacity', 1)

          tooltip.html(period + '<br/>' + temp + '<br/>' + variance)
            .attr('data-year', e.target.attributes['data-year'].value)
            .style("left", e.target.attributes.x.value + "px")
            .style("top", (parseInt(e.target.attributes.y.value) + rectHeight) + "px")
            .style('text-align', 'center')
        })
        .on('mouseout', (e, d) => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0)
        })

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(10))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(t => d3.timeFormat('%B')(new Date(t + '-1-2000')))

    svg.append('g')
      .attr('transform', 'translate(0, ' + (h - paddingY.bottom) + ')')
      .attr('id', 'x-axis')
      .call(xAxis)

    svg.append('g')
      .attr('transform', 'translate(' + paddingX.left + ', 0)')
      .attr('id', 'y-axis')
      .call(yAxis)

    const legendRectHeight = 18
    const legendRectWidth = 25
    const tempInterval = (tempRange[1] - tempRange[0]) / colorQuants.length

    const legendScale = d3.scaleLinear()
      .domain(tempRange)
      .range([paddingX.left, legendRectWidth * colorQuants.length + paddingX.left])

    const legendAxis = d3.axisBottom(legendScale)
      .tickValues(d3.range(tempRange[0], tempRange[1], tempInterval))
      .tickFormat(t => d3.format('.1f')(t))

    const legend = svg.append('g')
      .attr('id', 'legend')

    legend.selectAll('rect')
      .data(colorQuants)
      .enter()
      .append('rect')
        .attr('x', (d, i) => legendScale(tempRange[0] + i * tempInterval))
        .attr('y', h - paddingY.top - legendRectHeight)
        .attr('fill', d => d)
        .attr('width', legendRectWidth)
        .attr('height', legendRectHeight)

    legend.append('g')
      .attr('transform', 'translate(0, ' + (h - paddingY.top) +  ')')
      .call(legendAxis)

  }
  request.open('GET', url, true)
  request.send()
})
