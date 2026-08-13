package com.icap.mobile.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AlarmModule"

    @ReactMethod
    fun scheduleAlarm(alarmId: String, timeStr: String, title: String, category: String, promise: Promise) {
        try {
            val parts = timeStr.split(":")
            if (parts.size < 2) {
                promise.reject("INVALID_TIME", "Time must be HH:MM format")
                return
            }
            val hours = parts[0].toInt()
            val minutes = parts[1].toInt()

            val calendar = java.util.Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                set(java.util.Calendar.HOUR_OF_DAY, hours)
                set(java.util.Calendar.MINUTE, minutes)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)
                if (before(java.util.Calendar.getInstance())) {
                    add(java.util.Calendar.DAY_OF_YEAR, 1)
                }
            }

            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (!alarmManager.canScheduleExactAlarms()) {
                    promise.reject("EXACT_ALARM_PERMISSION_DENIED", "Exact alarm permission is not granted")
                    return
                }
            }

            val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
                putExtra("alarm_id", alarmId)
                putExtra("title", title)
                putExtra("category", category)
            }

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                alarmId.hashCode(),
                intent,
                flags
            )

            val showIntent = PendingIntent.getActivity(
                reactContext,
                alarmId.hashCode(),
                reactContext.packageManager.getLaunchIntentForPackage(reactContext.packageName),
                flags
            )

            val clockInfo = AlarmManager.AlarmClockInfo(calendar.timeInMillis, showIntent)
            alarmManager.setAlarmClock(clockInfo, pendingIntent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SCHEDULE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                promise.resolve(alarmManager.canScheduleExactAlarms())
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactContext, AlarmReceiver::class.java)
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                alarmId.hashCode(),
                intent,
                flags
            )

            alarmManager.cancel(pendingIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopRingtone(promise: Promise) {
        try {
            val serviceIntent = Intent(reactContext, AlarmService::class.java)
            reactContext.stopService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }
}
