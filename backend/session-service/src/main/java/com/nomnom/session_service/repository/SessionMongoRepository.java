package com.nomnom.session_service.repository;

import com.nomnom.session_service.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionMongoRepository extends MongoRepository<Session, String> {
    List<Session> findByUserId(String userId);

    void deleteAllByUserId(String userId);
}
