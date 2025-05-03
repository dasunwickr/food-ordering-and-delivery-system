'use client'

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface Payment {
  userId: string
  restaurantId: string
  amount: number
  date: string // MM/DD/YYYY
}

interface AggregatedData {
  date: string
  total: number
}

export default function TranscriptPage() {
  const [data, setData] = useState<AggregatedData[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:4242/user-restaurant-payments')
        const json = await res.json()

        const payments: Payment[] = json.payments

        const totals: Record<string, number> = {}

        payments.forEach(payment => {
          totals[payment.date] = (totals[payment.date] || 0) + payment.amount
        })

        const aggregated: AggregatedData[] = Object.entries(totals).map(
          ([date, total]) => ({ date, total })
        )

        setData(aggregated)
      } catch (err) {
        console.error('Error loading payments:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Order Totals by Date
        </h2>
        <div className="overflow-x-auto">
          <BarChart
            width={Math.max(data.length * 60, 800)}
            height={300}
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  )
}