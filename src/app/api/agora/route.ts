import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelName, uid, role } = body;

    if (!channelName) {
      return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      console.error('Agora credentials missing from environment variables');
      return NextResponse.json({ error: 'Agora credentials missing' }, { status: 500 });
    }

    // Set expiration time (1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Use buildTokenWithUid for numeric UIDs (standard for this project)
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      agoraRole,
      privilegeExpiredTs
    );

    // Generate RTM Token for signaling
    const rtmToken = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      String(uid || 0),
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );

    return NextResponse.json({ token, rtmToken, appId });
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
