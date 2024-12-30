package com.abcpen;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

public class SignatureUtil {
    public static String[] generateSignature(String appId, String appSecret) {
        try {
            String ts = String.valueOf(System.currentTimeMillis() / 1000);
            String baseString = appId + ts;

            MessageDigest md5 = MessageDigest.getInstance("MD5");
            byte[] md5Bytes = md5.digest(baseString.getBytes(StandardCharsets.UTF_8));
            String md5Hex = bytesToHex(md5Bytes);

            Mac hmacSha1 = Mac.getInstance("HmacSHA1");
            SecretKeySpec secretKey = new SecretKeySpec(
                    appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA1");
            hmacSha1.init(secretKey);
            byte[] hmacBytes = hmacSha1.doFinal(md5Hex.getBytes(StandardCharsets.UTF_8));
            String signa = Base64.getEncoder().encodeToString(hmacBytes);

            return new String[]{signa, ts};
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}