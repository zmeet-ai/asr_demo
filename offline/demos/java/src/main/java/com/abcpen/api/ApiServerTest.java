package com.abcpen.api.test;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.UUID;

public class ApiServerTest {
    private static final Logger logger = LoggerFactory.getLogger(ApiServerTest.class);
    private static final String BASE_URL = "https://audio.abcpen.com:8443";
    private static final String APPLICATION_KEY = "test1";
    private static final String APPLICATION_SECRET = "2258ACC4-199B-4DCB-B6F3-C2485C63E85A";

    public static void main(String[] args) throws Exception {
        ApiServerTest test = new ApiServerTest();
        test.testAsrWorkflow();
    }

    public void testAsrWorkflow() throws Exception {
        String audioUrl = "https://zos.abcpen.com/denoise/test/weiya.wav";
        String appId = "test_app";
        String taskId = UUID.randomUUID().toString();
        String language = "en";

        try {
            // 提交任务
            JSONObject submitResponse = submitTask(audioUrl, appId, taskId, language);
            logger.info("Submit Response: {}", submitResponse);

            // 循环检查任务状态
            while (true) {
                JSONObject statusResponse = checkStatus(taskId);
                logger.info("Status Response: {}", statusResponse);

                String status = statusResponse.getString("status");
                if ("completed".equals(status)) {
                    logger.info("Task completed!");
                    break;
                } else if ("not_found".equals(status)) {
                    logger.info("Task not found or expired!");
                    break;
                } else {
                    logger.info("Task is still processing...");
                }

                Thread.sleep(5000);
            }

            // 获取任务结果
            JSONObject resultResponse = getResult(taskId);
            logger.info("Result Response: {}", resultResponse);
        } catch (Exception e) {
            logger.error("Test failed with exception", e);
            throw e;
        }
    }

    private String generateSignature() throws Exception {
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        String baseString = APPLICATION_KEY + timestamp;
        
        // 计算 MD5
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        byte[] md5Bytes = md5.digest(baseString.getBytes(StandardCharsets.UTF_8));
        String md5String = bytesToHex(md5Bytes);
        
        // 计算 HMAC-SHA1
        Mac hmacSha1 = Mac.getInstance("HmacSHA1");
        SecretKeySpec secretKey = new SecretKeySpec(APPLICATION_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA1");
        hmacSha1.init(secretKey);
        byte[] hmacBytes = hmacSha1.doFinal(md5String.getBytes(StandardCharsets.UTF_8));
        
        // Base64 编码
        return Base64.getEncoder().encodeToString(hmacBytes);
    }

    private JSONObject submitTask(String audioUrl, String appId, String taskId, String language) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(BASE_URL + "/asr-offline/submit_task/v1");
            
            // 设置请求头
            String signature = generateSignature();
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            post.setHeader("X-App-Key", APPLICATION_KEY);
            post.setHeader("X-App-Signature", signature);
            post.setHeader("X-Timestamp", timestamp);
            post.setHeader("Content-Type", "application/json");

            // 设置请求体
            JSONObject requestBody = new JSONObject();
            requestBody.put("audio_url", audioUrl);
            requestBody.put("app_id", appId);
            requestBody.put("task_id", taskId);
            requestBody.put("language", language);
            
            StringEntity entity = new StringEntity(requestBody.toString());
            post.setEntity(entity);

            // 发送请求并获取响应
            return new JSONObject(EntityUtils.toString(client.execute(post).getEntity()));
        }
    }

    private JSONObject checkStatus(String taskId) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet get = new HttpGet(BASE_URL + "/asr-offline/check_status/v1/" + taskId);
            
            // 设置请求头
            String signature = generateSignature();
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            get.setHeader("X-App-Key", APPLICATION_KEY);
            get.setHeader("X-App-Signature", signature);
            get.setHeader("X-Timestamp", timestamp);

            // 发送请求并获取响应
            return new JSONObject(EntityUtils.toString(client.execute(get).getEntity()));
        }
    }

    private JSONObject getResult(String taskId) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet get = new HttpGet(BASE_URL + "/asr-offline/get_result/v1/" + taskId);
            
            // 设置请求头
            String signature = generateSignature();
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            get.setHeader("X-App-Key", APPLICATION_KEY);
            get.setHeader("X-App-Signature", signature);
            get.setHeader("X-Timestamp", timestamp);

            // 发送请求并获取响应
            return new JSONObject(EntityUtils.toString(client.execute(get).getEntity()));
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}