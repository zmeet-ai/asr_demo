package com.abcpen.ai.rtasr;

import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ClientHandshakeBuilder;

import com.sun.istack.internal.NotNull;

@SuppressWarnings("deprecation")
public class DraftWithOrigin extends Draft_17 {

    private final String originUrl;

    public DraftWithOrigin(String originUrl) {
        this.originUrl = originUrl;
    }

    @Override
    public Draft copyInstance() {
        System.out.println(originUrl);
        return new DraftWithOrigin(originUrl);
    }

    @NotNull
    @Override
    public ClientHandshakeBuilder postProcessHandshakeRequestAsClient(@NotNull ClientHandshakeBuilder request) {
        super.postProcessHandshakeRequestAsClient(request);
        request.put("Origin", originUrl);
        return request;
    }
}
