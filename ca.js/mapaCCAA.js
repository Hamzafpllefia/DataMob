// mapaCCAA.js
// Requiere D3 v7 y topojson-client cargados en el HTML

function crearMapaCCAA(
  containerSelector,
  geoData,
  datosPorComunidad,
  año,
  opciones = {},
) {
  const container = d3.select(containerSelector);
  if (container.empty()) return;

  const {
    colorFondo = "#020617",
    colorTexto = "#e5e7eb",
    colorBorde = "#020617",
    escalaColores = d3.interpolateBlues,
    padding = { top: 32, right: 16, bottom: 32, left: 16 },
    titulo = `Víctimas por comunidad autónoma (${año})`,
  } = opciones;

  container.select("svg").remove();
  container.selectAll("div.__tooltip-mapa").remove();
  container.selectAll("div.__click-info-mapa").remove();

  const width = container.node().clientWidth || 900;
  const height = container.node().clientHeight || 520;

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "100%")
    .style("background", colorFondo);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${padding.left},${padding.top})`);

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      g.attr(
        "transform",
        `translate(${padding.left + event.transform.x},${padding.top + event.transform.y}) scale(${event.transform.k})`,
      );
    });

  svg.call(zoom);

  // Reset zoom to initial state
  svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity);

  function reset() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    hideTooltip();
    hideClickInfo();
    g.selectAll("path").attr("stroke", colorBorde).attr("stroke-width", 1);
  }

  svg.on("click", reset);

  const features =
    geoData.type === "Topology"
      ? topojson.feature(geoData, Object.values(geoData.objects)[0]).features
      : geoData.features;

  const valores = features.map((f) => {
    const nombre = f.properties.name;
    const registro = datosPorComunidad[nombre];
    const valor = registro && registro[año] != null ? +registro[año] : 0;
    return { nombre, valor };
  });

  const maxValor = d3.max(valores, (d) => d.valor) || 1;

  // Mapa en escala azul: mayor número de víctimas = azul más oscuro
  const color = d3
    .scaleSequential(escalaColores)
    .domain([0, maxValor]);

  const projection = d3.geoMercator().fitSize([innerWidth, innerHeight], {
    type: "FeatureCollection",
    features,
  });

  const path = d3.geoPath().projection(projection);

  const tooltip = container
    .append("div")
    .attr("class", "__tooltip-mapa")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(0,0,0,0.75)")
    .style("color", "#f9fafb")
    .style("padding", "0.35rem 0.5rem")
    .style("font-size", "0.75rem")
    .style("border-radius", "0.35rem")
    .style("border", "1px solid rgba(255,255,255,0.7)")
    .style("box-shadow", "0 8px 20px rgba(0,0,0,0.45)")
    .style("opacity", 0)
    .style("z-index", 999);

  const clickInfo = container
    .append("div")
    .attr("class", "__click-info-mapa")
    .style("position", "absolute")
    .style("bottom", "12px")
    .style("left", "12px")
    .style("background", "rgba(0,0,0,0.72)")
    .style("color", "#ffffff")
    .style("padding", "0.4rem 0.6rem")
    .style("font-size", "0.75rem")
    .style("border-radius", "0.4rem")
    .style("border", "1px solid rgba(255,255,255,0.65)")
    .style("box-shadow", "0 8px 20px rgba(0,0,0,0.4)")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("z-index", 999);

  function showTooltip(text, x, y) {
    tooltip
      .html(text)
      .style("left", `${x + 10}px`)
      .style("top", `${y - 28}px`)
      .style("opacity", 1);
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  function showClickInfo(text) {
    clickInfo.html(text).style("opacity", 1);
  }

  function hideClickInfo() {
    clickInfo.style("opacity", 0);
  }

  function handleMouseOver(event, d) {
    const nombre = d.properties.name;
    const registro = datosPorComunidad[nombre];
    const valor = registro && registro[año] != null ? +registro[año] : 0;

    d3.select(this).attr("stroke-width", 2).attr("stroke", "#f9fafb");

    const labelYear = año === "total" ? "totales (2016-2024)" : año;
    showTooltip(
      `<strong>${nombre}</strong><br/>Víctimas ${labelYear}: <strong>${d3.format(",")(valor)}</strong>`,
      event.pageX,
      event.pageY,
    );
  }

  function handleMouseMove(event) {
    showTooltip(tooltip.node().innerHTML, event.pageX, event.pageY);
  }

  function handleMouseOut() {
    d3.select(this).attr("stroke-width", 1).attr("stroke", colorBorde);
    hideTooltip();
  }

  function clicked(event, d) {
    event.stopPropagation();
    g.selectAll("path").attr("stroke", colorBorde).attr("stroke-width", 1);
    d3.select(event.currentTarget)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5);

    const bounds = path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(
      1,
      Math.min(8, 0.9 / Math.max(dx / innerWidth, dy / innerHeight)),
    );
    const translate = [innerWidth / 2 - scale * x, innerHeight / 2 - scale * y];
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
      );

    const nombre = d.properties.name;
    const registro = datosPorComunidad[nombre];
    const valor = registro && registro[año] != null ? +registro[año] : 0;
    const labelYear = año === "total" ? "totales (2016-2024)" : año;
    const texto = `<strong>${nombre}</strong><br/>Víctimas ${labelYear}: <strong>${d3.format(",")(valor)}</strong>`;

    showTooltip(texto, event.pageX, event.pageY);
    showClickInfo(texto);
  }

  g.selectAll("path")
    .data(features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const nombre = d.properties.name;
      const registro = datosPorComunidad[nombre];
      const valor = registro && registro[año] != null ? +registro[año] : 0;
      return valor > 0 ? color(valor) : "#111827";
    })
    .attr("stroke", colorBorde)
    .attr("stroke-width", 1)
    .attr("vector-effect", "non-scaling-stroke")
    .on("mouseenter", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseOut)
    .on("click", clicked);

  // título
  svg
    .append("text")
    .attr("x", padding.left)
    .attr("y", padding.top * 0.9)
    .attr("fill", colorTexto)
    .attr("font-size", 18)
    .attr("font-weight", "600")
    .attr(
      "font-family",
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    )
    .text(titulo);

  // leyenda
  const legendWidth = 160;
  const legendHeight = 10;
  const legendX = width - legendWidth - padding.right - 10;
  const legendY = height - padding.bottom - 30;

  const legendScale = d3
    .scaleLinear()
    .domain(color.domain())
    .range([0, legendWidth]);

  const legend = svg
    .append("g")
    .attr("transform", `translate(${legendX},${legendY})`);

  const legendGradientId = "gradMapaCCAA";
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient").attr("id", legendGradientId);

  gradient
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  d3.range(0, 1.01, 0.1).forEach((t) => {
    gradient
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", color(legendScale.invert(t * legendWidth)));
  });

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("rx", 4)
    .attr("fill", `url(#${legendGradientId})`);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(3)
    .tickSize(4)
    .tickFormat(d3.format(".2s"));

  legend
    .append("g")
    .attr("transform", `translate(0,${legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
    .attr("fill", colorTexto)
    .attr("font-size", 9);

  legend.selectAll(".domain, .tick line").attr("stroke", "#4b5563");
}

if (typeof window !== "undefined") {
  window.crearMapaCCAA = crearMapaCCAA;
}
