import { ImmutableClient } from './client.js';
import { PendingEvent } from './pending-event.js';
export class Immutable {
    client;
    constructor(config) {
        this.client = new ImmutableClient(config);
    }
    actor(actor) {
        return new PendingEvent(this.client, actor);
    }
    get events() {
        const client = this.client;
        return {
            list(filters) {
                return client.getEvents(filters);
            },
            get(id) {
                return client.getEvent(id);
            },
            verify(from, to, limit) {
                return client.verify(from, to, limit);
            },
            createExport(filters) {
                return client.createExport(filters);
            },
            getExport(id) {
                return client.getExport(id);
            },
        };
    }
    get alerts() {
        const client = this.client;
        return {
            list(filters) {
                return client.getAlerts(filters);
            },
        };
    }
}
//# sourceMappingURL=immutable.js.map