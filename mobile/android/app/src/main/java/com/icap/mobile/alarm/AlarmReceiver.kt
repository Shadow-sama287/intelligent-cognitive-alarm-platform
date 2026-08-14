package com.icap.mobile.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarm_id") ?: return
        val title = intent.getStringExtra("title") ?: "Alarm Ringing!"
        val category = intent.getStringExtra("category") ?: "math"

        val serviceIntent = Intent(context, AlarmService::class.java).apply {
            putExtra("alarm_id", alarmId)
            putExtra("title", title)
            putExtra("category", category)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }
}
