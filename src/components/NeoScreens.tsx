import type { ReactElement } from 'react'
import { NeoLogo } from './NeoLogo'
import type { NeoStep } from '../data/content'

const navItems: Record<NeoStep['key'], string> = {
  dashboard: 'Dashboard',
  fuel: 'Fuel Pricing',
  pos: 'Send to POS',
  ai: 'AI Chat',
}

function Side({ active }: { active: NeoStep['key'] }) {
  return (
    <aside className="ui-side">
      <div className="ui-brand"><NeoLogo /> Neo Office</div>
      <span className="k">MAIN</span>
      <span className={`item${active === 'dashboard' ? ' on' : ''}`}>Dashboard</span>
      <span className={`item${active === 'ai' ? ' on' : ''}`}>AI Chat</span>
      <span className="item">Transactions</span>
      <span className="k">PRICING</span>
      <span className={`item${active === 'fuel' ? ' on' : ''}`}>Fuel Pricing</span>
      <span className="item">Item Pricing</span>
      <span className={`item${active === 'pos' ? ' on' : ''}`}>Send to POS</span>
      <span className="k">OPERATIONS</span>
      <span className="item">Inventory</span>
      <span className="item">Lottery</span>
    </aside>
  )
}

const bars = [2, 3, 2, 1, 1, 2, 4, 6, 7, 6, 5, 6, 7, 8, 7, 6, 6, 7, 8, 6, 5, 4, 3, 2]

export function Dashboard() {
  return (
    <div className="ui">
      <Side active="dashboard" />
      <div className="ui-main">
        <div className="ui-head"><h4>Dashboard</h4><span className="mono">Today · America/Chicago</span></div>
        <div className="ui-tiles">
          <div className="ui-tile"><span className="k">Inside sales</span><span className="v">$10,213.14</span><span className="s">36% of sales</span></div>
          <div className="ui-tile"><span className="k">Fuel</span><span className="v">2,397 gal</span><span className="s">$18,904.55</span></div>
          <div className="ui-tile"><span className="k">Total sales</span><span className="v">$27,882.51</span><span className="s">412 transactions</span></div>
          <div className="ui-tile"><span className="k">Tax collected</span><span className="v">$1,434.83</span><span className="s">5.5% of sales</span></div>
        </div>
        <div className="ui-chart">
          <span className="k" style={{ color: '#8a8d9a', fontSize: 9.5 }}>Hourly sales</span>
          <svg viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden="true">
            {bars.map((b, i) => (
              <rect key={i} x={i * 10 + 1} y={60 - b * 7} width={7} height={b * 7} rx={1.5} fill={i > 6 && i < 20 ? '#8aa2ff' : '#3a3d4c'} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

export function Fuel() {
  const rows = [
    ['Regular', '3.499', '3.539', '3.599'],
    ['Midgrade', '3.799', '3.799', '3.899'],
    ['Premium', '4.099', '4.099', '4.199'],
    ['Diesel', '3.999', '3.999', '4.099'],
  ]
  return (
    <div className="ui">
      <Side active="fuel" />
      <div className="ui-main">
        <div className="ui-head"><h4>Fuel Pricing</h4><span className="mono">Last updated · just now</span></div>
        <table className="ui-table">
          <thead><tr><th>Grade</th><th>Cash</th><th>New</th><th>Credit</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td>{r[0]}</td>
                <td style={{ color: r[1] !== r[2] ? '#7c7f8c' : undefined }}>{r[1]}</td>
                <td>{r[1] !== r[2] ? <span className="ui-up">→ {r[2]}</span> : r[2]}</td>
                <td>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ui-tag acc">6 grades · cash and credit</span>
          <span className="ui-btn">Send to POS</span>
        </div>
      </div>
    </div>
  )
}

export function SendToPos() {
  const rows = [
    ['5:52 AM', '10428', '24', 'Queued', ''],
    ['5:41 AM', '10427', '12', 'In progress', 'acc'],
    ['5:30 AM', '10426', '38', 'Retrying', 'warn'],
    ['5:12 AM', '10425', '9', 'Applied', 'ok'],
  ]
  return (
    <div className="ui">
      <Side active="pos" />
      <div className="ui-main">
        <div className="ui-head"><h4>Send to POS</h4><span className="mono">Gilbarco Passport · Connected</span></div>
        <table className="ui-table">
          <thead><tr><th>Queued</th><th>Batch</th><th>Items</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[1]}>
                <td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
                <td><span className={`ui-tag ${r[4]}`.trim()}>{r[3]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="k" style={{ color: '#8a8d9a', fontSize: 9.5 }}>A batch that does not land goes back in line and sends again by itself.</span>
      </div>
    </div>
  )
}

export function NeoAI() {
  return (
    <div className="ui">
      <Side active="ai" />
      <div className="ui-main">
        <div className="ui-head"><h4>Neo AI</h4><span className="mono">Sales · Fuel · Lottery</span></div>
        <div className="ui-chat">
          <div className="ui-msg me">What were total sales today?</div>
          <div className="ui-msg">
            Total sales <b>$27,882.51</b> across 412 transactions. Inside $10,213.14, fuel $18,904.55. Inside conversion 38.2%.
          </div>
          <div className="ui-msg me">Raise Regular cash by 4 cents at every store.</div>
          <div className="ui-msg">Drafted for 3 stores · Regular cash 3.499 → 3.539. <span className="ui-tag acc">Confirm &amp; run</span></div>
        </div>
        <div className="ui-input"><span>Ask Neo about your store…</span><span className="mono">⏎</span></div>
      </div>
    </div>
  )
}

export const screens: Record<NeoStep['key'], () => ReactElement> = {
  dashboard: Dashboard,
  fuel: Fuel,
  pos: SendToPos,
  ai: NeoAI,
}

export { navItems }
