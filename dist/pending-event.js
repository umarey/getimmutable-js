export class PendingEvent {
    client;
    actorData;
    idempotencyKeyValue;
    versionValue;
    sessionValue;
    targetsValue = [];
    actionCategoryValue;
    constructor(client, actor) {
        this.client = client;
        this.actorData = actor;
    }
    idempotencyKey(key) {
        this.idempotencyKeyValue = key;
        return this;
    }
    version(v) {
        this.versionValue = v;
        return this;
    }
    session(id) {
        this.sessionValue = id;
        return this;
    }
    actionCategory(category) {
        this.actionCategoryValue = category;
        return this;
    }
    target(type, id, name, metadata) {
        this.targetsValue.push({ type, id, name, metadata });
        return this;
    }
    targets(targets) {
        this.targetsValue = targets;
        return this;
    }
    async track(action, resource, metadata) {
        const payload = {
            actor_id: this.actorData.id,
            action,
        };
        if (this.actorData.name)
            payload.actor_name = this.actorData.name;
        if (this.actorData.type)
            payload.actor_type = this.actorData.type;
        if (typeof resource === 'string') {
            payload.resource = resource;
        }
        else if (resource) {
            payload.resource = resource.type;
            payload.resource_id = resource.id;
            if (resource.name)
                payload.resource_name = resource.name;
        }
        if (this.actionCategoryValue)
            payload.action_category = this.actionCategoryValue;
        if (metadata && Object.keys(metadata).length > 0)
            payload.metadata = metadata;
        if (this.targetsValue.length > 0)
            payload.targets = this.targetsValue;
        if (this.idempotencyKeyValue)
            payload.idempotency_key = this.idempotencyKeyValue;
        if (this.versionValue)
            payload.version = this.versionValue;
        if (this.sessionValue)
            payload.session_id = this.sessionValue;
        return this.client.track(payload);
    }
}
//# sourceMappingURL=pending-event.js.map