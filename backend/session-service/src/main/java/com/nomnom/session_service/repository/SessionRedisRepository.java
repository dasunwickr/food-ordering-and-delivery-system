package com.nomnom.session_service.repository;

import com.nomnom.session_service.model.Session;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRedisRepository extends CrudRepository<Session, String> {
}
