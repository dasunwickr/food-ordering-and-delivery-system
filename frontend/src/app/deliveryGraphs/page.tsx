'use client'

import React, { useEffect, useState } from 'react'
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts'

interface DriverPayment {
  driverId: string
  deliveryFee: number
  date: string // formatted as MM/DD/YYYY
}

interface AggregatedData {
  date: string
  total: number
}

export default function DriverPaymentsChart() {
  const [data, setData] = useState<AggregatedData[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:4242/driver-payments')
        const json = await res.json()

        const payments: DriverPayment[] = json.payments

        const totals: Record<string, number> = {}

        payments.forEach(payment => {
          totals[payment.date] = (totals[payment.date] || 0) + payment.deliveryFee
        })

        const aggregated: AggregatedData[] = Object.entries(totals).map(
          ([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) })
        )

        aggregated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setData(aggregated)
      } catch (err) {
        console.error('Error loading driver payments:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-10">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-[95vw]">
        <h2 className="text-3xl font-bold mb-6 text-center">📈 Delivery Fee Totals by Date</h2>
        <div className="overflow-x-auto">
          <div style={{ width: `${Math.max(data.length * 80, 1200)}px` }}>
            <LineChart
              width={Math.max(data.length * 80, 1200)}
              height={500}
              data={data}
              margin={{ top: 20, right: 40, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={120}
                tick={{ fontSize: 14 }}
              />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={3} dot={false} />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  )
}
