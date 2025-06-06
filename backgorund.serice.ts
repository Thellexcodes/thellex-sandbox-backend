// ✅ Here's the Reliable Setup You Need:
// 1. Foreground Service with a Notification
// Your SocketService must be a foreground service and must call startForeground() immediately.

// kotlin
// Copy
// Edit
// // In your SocketService.kt
// override fun onCreate() {
//     super.onCreate()
//     val notification = NotificationCompat.Builder(this, "socket_channel")
//         .setContentTitle("Thellex")
//         .setContentText("Listening for real-time updates.")
//         .setSmallIcon(R.drawable.ic_notification)
//         .build()

//     startForeground(1, notification)
//     connectToSocket()
// }
// Also, declare in AndroidManifest.xml:

// xml
// Copy
// Edit
// <service
//     android:name=".SocketService"
//     android:enabled="true"
//     android:exported="false"
//     android:foregroundServiceType="dataSync" />
// Request FOREGROUND_SERVICE_DATA_SYNC permission:

// xml
// Copy
// Edit
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
// 2. Auto-Restart on Reboot
// Register a BroadcastReceiver that starts your service on boot:

// kotlin
// Copy
// Edit
// class BootReceiver : BroadcastReceiver() {
//     override fun onReceive(context: Context, intent: Intent) {
//         if (Intent.ACTION_BOOT_COMPLETED == intent.action) {
//             val serviceIntent = Intent(context, SocketService::class.java)
//             ContextCompat.startForegroundService(context, serviceIntent)
//         }
//     }
// }
// Register in AndroidManifest.xml:

// xml
// Copy
// Edit
// <receiver android:name=".BootReceiver" android:enabled="true" android:exported="false">
//     <intent-filter>
//         <action android:name="android.intent.action.BOOT_COMPLETED" />
//     </intent-filter>
// </receiver>
// <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
// 3. Persist Socket After Swipe or Kill (Optional but Risky)
// Android does not officially support keeping services alive after swiping away unless:

// You use START_STICKY in onStartCommand()

// And the service is in foreground mode

// BUT this still can be killed under heavy memory pressure or user action.

// kotlin
// Copy
// Edit
// override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
//     // Reconnect if killed
//     connectToSocket()
//     return START_STICKY
// }
