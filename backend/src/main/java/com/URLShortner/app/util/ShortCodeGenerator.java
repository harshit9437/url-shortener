package com.URLShortner.app.util;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
@Component
public class ShortCodeGenerator {
    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    private static final SecureRandom RANDOM=new SecureRandom();
    public String generate(){
        StringBuilder shortCode=new StringBuilder();
        for(int i=0;i<SHORT_CODE_LENGTH;i++){
            int randomIndex= RANDOM.nextInt(CHARACTERS.length());
            char randomChar = CHARACTERS.charAt(randomIndex);
            shortCode.append(randomChar);
        }
        return shortCode.toString();
    }
}
