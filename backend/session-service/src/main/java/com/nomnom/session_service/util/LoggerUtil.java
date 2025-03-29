package com.nomnom.session_service.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggerUtil {

    /**
     * Logs an INFO-level message.
     *
     * @param clazz   The class where the log originates.
     * @param message The log message (can include placeholders {}).
     * @param args    Arguments to replace placeholders in the message.
     */
    public static void info(Class<?> clazz, String message, Object... args) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.info(message, args);
    }

    /**
     * Logs a WARN-level message.
     *
     * @param clazz   The class where the log originates.
     * @param message The log message (can include placeholders {}).
     * @param args    Arguments to replace placeholders in the message.
     */
    public static void warn(Class<?> clazz, String message, Object... args) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.warn(message, args);
    }

    /**
     * Logs an ERROR-level message.
     *
     * @param clazz   The class where the log originates.
     * @param message The log message (can include placeholders {}).
     * @param args    Arguments to replace placeholders in the message.
     */
    public static void error(Class<?> clazz, String message, Object... args) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.error(message, args);
    }

    /**
     * Logs a DEBUG-level message.
     *
     * @param clazz   The class where the log originates.
     * @param message The log message (can include placeholders {}).
     * @param args    Arguments to replace placeholders in the message.
     */
    public static void debug(Class<?> clazz, String message, Object... args) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.debug(message, args);
    }

    /**
     * Logs an ERROR-level message with an exception stack trace.
     *
     * @param clazz     The class where the log originates.
     * @param message   The log message (can include placeholders {}).
     * @param throwable The exception to log.
     * @param args      Arguments to replace placeholders in the message.
     */
    public static void errorWithException(Class<?> clazz, String message, Throwable throwable, Object... args) {
        Logger logger = LoggerFactory.getLogger(clazz);
        logger.error(message, args, throwable);
    }
}