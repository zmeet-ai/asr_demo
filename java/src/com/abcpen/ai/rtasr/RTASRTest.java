package com.abcpen.ai.rtasr;

import java.io.RandomAccessFile;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.io.IOException;

import org.java_websocket.WebSocket.READYSTATE;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.drafts.Draft;
import org.java_websocket.handshake.ServerHandshake;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.abcpen.ai.rtasr.util.EncryptUtil;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * 运行前：请先填写APPID、SECRET_KEY
 * <p>
 * 实时转写调用demo
 * 此demo只是一个简单的调用示例，不适合用到实际生产环境中
 *
 * @author zmeet
 */
public class RTASRTest {

    // appid
    private static final String APPID = "test1";

    // appid对应的secret_key
    private static final String SECRET_KEY = "2258ACC4-199B-4DCB-B6F3-C2485C63E85A";

    // 请求地址
    private static final String HOST = "ai.abcpen.com/v1/asr/ws";

    private static final String BASE_URL = "wss://" + HOST;

    private static final String ORIGIN = "http://" + HOST;

    // 音频文件路径
    private static final String AUDIO_PATH = "./resource/test_1.pcm";

    // 每次发送的数据大小 1280 字节
    private static final int CHUNCKED_SIZE = 6400;

    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyy-MM-dd HH:mm:ss.SSS");

    public static void main(String[] args) throws Exception {
        while (true) {
            URI url = new URI(BASE_URL + getHandShakeParams(APPID, SECRET_KEY));
            //DraftWithOrigin draft = new DraftWithOrigin(ORIGIN);
            Draft_17 draft = new Draft_17();
            CountDownLatch handshakeSuccess = new CountDownLatch(1);
            CountDownLatch connectClose = new CountDownLatch(1);
            MyWebSocketClient client = new MyWebSocketClient(url, draft, handshakeSuccess, connectClose);

            client.connect();

            while (!client.getReadyState().equals(READYSTATE.OPEN)) {
                System.out.println(getCurrentTimeStr() + "\t连接中");
                Thread.sleep(1000);
            }

            // 等待握手成功
            handshakeSuccess.await();
            System.out.println(sdf.format(new Date()) + " 开始发送音频数据");
            // 发送音频
            byte[] bytes = new byte[CHUNCKED_SIZE];
            try (RandomAccessFile raf = new RandomAccessFile(AUDIO_PATH, "r")) {
                int len = -1;
                long lastTs = 0;
                while ((len = raf.read(bytes)) != -1) {
                    if (len < CHUNCKED_SIZE) {
                        send(client, bytes = Arrays.copyOfRange(bytes, 0, len));
                        break;
                    }

                    long curTs = System.currentTimeMillis();
                    if (lastTs == 0) {
                        lastTs = System.currentTimeMillis();
                    } else {
                        long s = curTs - lastTs;
                        if (s < 40) {
                            System.out.println("error time interval: " + s + " ms");
                        }
                    }
                    send(client, bytes);
                    // 每隔40毫秒发送一次数据
                    Thread.sleep(40);
                }

                // 发送结束标识
                send(client, "{\"end\": true}".getBytes());
                System.out.println(getCurrentTimeStr() + "\t发送结束标识完成");
            } catch (Exception e) {
                e.printStackTrace();
            }

            // 等待连接关闭
            connectClose.await();
            break;
        }
    }

    // 生成握手参数
    public static String getHandShakeParams(String appId, String secretKey) {
        String ts = System.currentTimeMillis() / 1000 + "";
        String signa = "";
        try {
            signa = EncryptUtil.HmacSHA1Encrypt(EncryptUtil.MD5(appId + ts), secretKey);
            return "?appid=" + appId + "&ts=" + ts + "&signa=" + URLEncoder.encode(signa, "UTF-8");
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }

    public static void send(WebSocketClient client, byte[] bytes) {
        if (client.isClosed()) {
            throw new RuntimeException("client connect closed!");
        }

        client.send(bytes);
    }

    public static String getCurrentTimeStr() {
        return sdf.format(new Date());
    }

    public static class MyWebSocketClient extends WebSocketClient {

        private final CountDownLatch handshakeSuccess;
        private final CountDownLatch connectClose;
        private URI serverUri;

        public MyWebSocketClient(URI serverUri, Draft protocolDraft, CountDownLatch handshakeSuccess, CountDownLatch connectClose) throws IOException {
            super(serverUri, protocolDraft);
            serverUri = serverUri;
            this.handshakeSuccess = handshakeSuccess;
            this.connectClose = connectClose;
            if (serverUri.toString().contains("wss")) {
                trustAllHosts(this);
            }

        }

        @Override
        public void onOpen(ServerHandshake handshake) {
            System.out.println(getCurrentTimeStr() + "\t连接建立成功！");
        }

        @Override
        public void onMessage(String msg) {
            try {
                if (msg.length() <= 2)
                    return;
                JSONObject msgObj = JSON.parseObject(msg);
                String action = msgObj.getString("action");
                if (Objects.equals("started", action)) {
                    // 握手成功
                    System.out.println(getCurrentTimeStr() + "\t握手成功！sid: " + msgObj.getString("sid"));
                    handshakeSuccess.countDown();
                } else if (Objects.equals("result", action)) {
                    // 转写结果
                    System.out.println(getCurrentTimeStr() + "\tresult: " + getContent(msgObj.getString("data")));
                } else if (Objects.equals("error", action)) {
                    // 连接发生错误
                    System.out.println("Error: " + msg);
                    System.exit(0);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onError(Exception e) {
            System.out.println(getCurrentTimeStr() + "\t连接发生错误：" + e.getMessage() + ", " + new Date());
            e.printStackTrace();
            System.exit(0);
        }

        @Override
        public void onClose(int arg0, String arg1, boolean arg2) {
            System.out.println(getCurrentTimeStr() + "\t链接关闭");
            connectClose.countDown();
        }

        @Override
        public void onMessage(ByteBuffer bytes) {
            System.out.println(getCurrentTimeStr() + "\t服务端返回：" + new String(bytes.array(), StandardCharsets.UTF_8));
        }

        public void trustAllHosts(MyWebSocketClient appClient) {
            System.out.println("wss");
            TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager() {
                @Override
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return new java.security.cert.X509Certificate[]{};
                }

                @Override
                public void checkClientTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
                    // TODO Auto-generated method stub

                }

                @Override
                public void checkServerTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
                    // TODO Auto-generated method stub

                }
            }};

            try {
                SSLContext sc = SSLContext.getInstance("TLS");
                sc.init(null, trustAllCerts, new java.security.SecureRandom());
                appClient.setSocket(sc.getSocketFactory().createSocket());
                //setSocket(SSLSocketFactory.getDefault().createSocket(serverUri.getHost(), 443));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // 把转写结果解析为句子
    public static String getContent(String message) {
        StringBuffer resultBuilder = new StringBuffer();
        try {
            JSONObject messageObj = JSON.parseObject(message);
            JSONObject cn = messageObj.getJSONObject("cn");
            JSONObject st = cn.getJSONObject("st");
            JSONArray rtArr = st.getJSONArray("rt");
            for (int i = 0; i < rtArr.size(); i++) {
                JSONObject rtArrObj = rtArr.getJSONObject(i);
                JSONArray wsArr = rtArrObj.getJSONArray("ws");
                for (int j = 0; j < wsArr.size(); j++) {
                    JSONObject wsArrObj = wsArr.getJSONObject(j);
                    JSONArray cwArr = wsArrObj.getJSONArray("cw");
                    for (int k = 0; k < cwArr.size(); k++) {
                        JSONObject cwArrObj = cwArr.getJSONObject(k);
                        String wStr = cwArrObj.getString("w");
                        resultBuilder.append(wStr);
                    }
                }
            }
        } catch (Exception e) {
            return message;
        }

        return resultBuilder.toString();
    }
}
