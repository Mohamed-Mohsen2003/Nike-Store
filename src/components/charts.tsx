import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { area, line, curveMonotoneX, arc, pie } from 'd3-shape';
import { scaleLinear, scaleBand } from 'd3-scale';
import { useInView, CountUp } from '../lib/motion';

function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ------------------------------ Area chart ------------------------------- */
type Series = { key: string; label: string; color: string; values: number[]; dashed?: boolean };
export function AreaChart({
  labels,
  series,
  height = 280,
  format = (n) => n.toLocaleString(),
  tooltipLabel,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  format?: (n: number) => string;
  tooltipLabel?: (i: number) => ReactNode;
}) {
  const [wrap, width] = useSize<HTMLDivElement>();
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const m = { t: 16, r: 12, b: 28, l: 48 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.12;
  const x = scaleLinear().domain([0, labels.length - 1]).range([0, iw]);
  const y = scaleLinear().domain([0, max]).range([ih, 0]).nice();
  const ticks = y.ticks(4);
  const ln = line<number>().x((_, i) => x(i)).y((d) => y(d)).curve(curveMonotoneX);
  const ar = area<number>().x((_, i) => x(i)).y0(ih).y1((d) => y(d)).curve(curveMonotoneX);
  const every = Math.ceil(labels.length / Math.max(3, Math.floor(iw / 80)));

  return (
    <div
      ref={(el) => {
        wrap.current = el;
        ref.current = el;
      }}
      className={`chart ${seen ? 'drawn' : ''}`}
      onMouseLeave={() => setHover(null)}
    >
      <svg width={width} height={height} role="img">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${uid}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity="0.32" />
              <stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <clipPath id={`clip-${uid}`}>
            <rect className="chart-clip" x="0" y="-10" height={ih + 20} width={iw} />
          </clipPath>
        </defs>
        <g transform={`translate(${m.l},${m.t})`}>
          {ticks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x2={iw} className="grid" />
              <text x={-10} dy="0.32em" textAnchor="end" className="axis">
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % every === 0 ? (
              <text key={i} x={x(i)} y={ih + 20} textAnchor="middle" className="axis">
                {l}
              </text>
            ) : null,
          )}
          <g clipPath={`url(#clip-${uid})`}>
            {series.map((s) => (
              <g key={s.key}>
                {!s.dashed && <path d={ar(s.values) ?? ''} fill={`url(#g-${uid}-${s.key})`} />}
                <path d={ln(s.values) ?? ''} fill="none" stroke={s.color} strokeWidth={s.dashed ? 1.6 : 2.4} strokeDasharray={s.dashed ? '5 5' : undefined} strokeLinecap="round" />
              </g>
            ))}
          </g>
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y2={ih} className="crosshair" />
              {series.map((s) => (
                <circle key={s.key} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill="var(--surface)" stroke={s.color} strokeWidth={2.5} />
              ))}
            </g>
          )}
          <rect
            width={iw}
            height={ih}
            fill="transparent"
            onMouseMove={(e) => {
              const r = (e.target as SVGRectElement).getBoundingClientRect();
              setHover(Math.max(0, Math.min(labels.length - 1, Math.round(x.invert(e.clientX - r.left)))));
            }}
          />
        </g>
      </svg>
      {hover !== null && (
        <div className="tooltip" style={{ left: Math.min(width - 170, Math.max(0, m.l + x(hover) - 80)), top: 0 }}>
          <div className="tt-label">{tooltipLabel ? tooltipLabel(hover) : labels[hover]}</div>
          {series.map((s) => (
            <div key={s.key} className="tt-row">
              <i style={{ background: s.color }} />
              <span>{s.label}</span>
              <b>{format(s.values[hover])}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Bar chart ------------------------------- */
export function BarChart({
  data,
  height = 260,
  format = (n) => n.toLocaleString(),
}: {
  data: { label: string; value: number; target?: number }[];
  height?: number;
  format?: (n: number) => string;
}) {
  const [wrap, width] = useSize<HTMLDivElement>();
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const [hover, setHover] = useState<number | null>(null);
  const m = { t: 12, r: 8, b: 28, l: 48 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;
  const x = scaleBand<number>().domain(data.map((_, i) => i)).range([0, iw]).padding(0.34);
  const max = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0))) * 1.1;
  const y = scaleLinear().domain([0, max]).range([ih, 0]).nice();
  return (
    <div
      ref={(el) => {
        wrap.current = el;
        ref.current = el;
      }}
      className="chart"
      onMouseLeave={() => setHover(null)}
    >
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="bar-g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <g transform={`translate(${m.l},${m.t})`}>
          {y.ticks(4).map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x2={iw} className="grid" />
              <text x={-10} dy="0.32em" textAnchor="end" className="axis">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const h = seen ? ih - y(d.value) : 0;
            const last = i === data.length - 1;
            return (
              <g key={i} onMouseEnter={() => setHover(i)}>
                <rect x={(x(i) ?? 0) - 4} width={x.bandwidth() + 8} height={ih} fill="transparent" />
                <rect
                  className="bar"
                  x={x(i)}
                  width={x.bandwidth()}
                  y={ih - h}
                  height={h}
                  rx={Math.min(7, x.bandwidth() / 3)}
                  fill={last ? 'url(#bar-g)' : 'var(--bar)'}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                  style={{ transitionDelay: `${i * 45}ms` }}
                />
                {d.target !== undefined && (
                  <line className="target" x1={(x(i) ?? 0) - 3} x2={(x(i) ?? 0) + x.bandwidth() + 3} y1={y(d.target)} y2={y(d.target)} style={{ opacity: seen ? 1 : 0, transitionDelay: `${600 + i * 45}ms` }} />
                )}
                <text x={(x(i) ?? 0) + x.bandwidth() / 2} y={ih + 20} textAnchor="middle" className="axis">
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {hover !== null && (
        <div className="tooltip" style={{ left: Math.min(width - 170, Math.max(0, m.l + (x(hover) ?? 0) - 60)), top: 0 }}>
          <div className="tt-label">{data[hover].label} 2026</div>
          <div className="tt-row">
            <i style={{ background: 'var(--accent)' }} />
            <span>Revenue</span>
            <b>{format(data[hover].value)}</b>
          </div>
          {data[hover].target !== undefined && (
            <div className="tt-row">
              <i style={{ background: 'var(--muted)' }} />
              <span>Target</span>
              <b>{format(data[hover].target!)}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Donut --------------------------------- */
export function Donut({ data, size = 200, center }: { data: { label: string; value: number; color: string }[]; size?: number; center?: ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [hover, setHover] = useState<number | null>(null);
  const r = size / 2;
  const arcs = useMemo(() => pie<{ value: number }>().value((d) => d.value).sort(null).padAngle(0.024)(data), [data]);
  const mk = arc<(typeof arcs)[number]>().innerRadius(r * 0.72).outerRadius(r - 2).cornerRadius(4);
  const mkHover = arc<(typeof arcs)[number]>().innerRadius(r * 0.7).outerRadius(r + 2).cornerRadius(4);
  return (
    <div className="donut" ref={ref} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`} className={seen ? 'spin-in' : ''}>
        {arcs.map((a, i) => (
          <path
            key={i}
            d={(hover === i ? mkHover(a) : mk(a)) ?? ''}
            fill={data[i].color}
            opacity={hover === null || hover === i ? 1 : 0.35}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ transition: 'opacity .2s, d .25s' }}
          />
        ))}
      </svg>
      <div className="donut-center">
        {hover !== null ? (
          <>
            <b>{data[hover].value}%</b>
            <span>{data[hover].label}</span>
          </>
        ) : (
          center
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Sparkline ------------------------------- */
export function Sparkline({ values, color = 'var(--accent)', width = 120, height = 36, fill = true }: { values: number[]; color?: string; width?: number; height?: number; fill?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const x = scaleLinear().domain([0, values.length - 1]).range([2, width - 2]);
  const y = scaleLinear().domain([Math.min(...values), Math.max(...values)]).range([height - 3, 3]);
  const ln = line<number>().x((_, i) => x(i)).y((d) => y(d)).curve(curveMonotoneX);
  const ar = area<number>().x((_, i) => x(i)).y0(height).y1((d) => y(d)).curve(curveMonotoneX);
  return (
    <svg width={width} height={height} className="spark">
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={ar(values) ?? ''} fill={`url(#sp-${uid})`} />}
      <path d={ln(values) ?? ''} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" className="spark-line" pathLength={1} />
    </svg>
  );
}

/* ------------------------------ Radial gauge ----------------------------- */
export function Gauge({ value, size = 150, label }: { value: number; size?: number; label: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const r = size / 2 - 10;
  const c = Math.PI * r;
  return (
    <div className="gauge" ref={ref} style={{ width: size, height: size / 2 + 18 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`} fill="none" stroke="var(--track)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={`M10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="url(#gauge-g)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={seen ? c * (1 - Math.min(100, value) / 100) : c}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)' }}
        />
        <defs>
          <linearGradient id="gauge-g">
            <stop offset="0" stopColor="var(--accent-2)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="gauge-label">
        <b>
          <CountUp value={value} format={(n) => Math.round(n) + '%'} duration={1600} />
        </b>
        <span>{label}</span>
      </div>
    </div>
  );
}
