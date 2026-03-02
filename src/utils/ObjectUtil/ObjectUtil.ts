

export class ObjectUtil {
    static isNullOrUndefined(value: any) {
        return value === null || value === undefined;
    }

    static list_to_tree({ list, key, parent_key, parent_value, child_var_name }: { list: any[]; key: string; parent_key: string; parent_value: string; child_var_name: string; }) {

        if (list.length <= 1) {
            return list;
        }
        var map: any = {};
        var roots: any[] = [];
        var i;
        for (i = 0; i < list.length; i += 1) {
            map[list[i][key]] = i;
            list[i][child_var_name] = [];
        }
        for (i = 0; i < list.length; i += 1) {
            if (list[i][parent_key] && list[i][parent_key] != parent_value) {
                if (list[map[list[i][parent_key]]] && list[map[list[i][parent_key]]][child_var_name]) {
                    list[map[list[i][parent_key]]][child_var_name].push(list[i]);
                }
            } else {
                roots.push(list[i]);
            }
        }
        return roots;
    }

    static checkIsEqual(array1: any, array2: any) {
        let status = JSON.stringify(array1) === JSON.stringify(array2);
        return !status
    }

    static checkPayloadValues(payload, properties) {
        return properties.every(prop => {
            const value = payload[prop];
            if (value === undefined) { // Check if the value is undefined
                return false;
            }
            if (Array.isArray(value)) {
                return value.length > 0; // Check if the array is not empty
            }
            return value !== ""; // Check if the string is not empty
        });
    }

    static getSlug(title) {
        return title
            .toLowerCase()            // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
            .trim()                   // Remove leading/trailing spaces
            .replace(/\s+/g, '-');    // Replace spaces with dashes
    }

    static ISJson(str: string): boolean {
        try {
            JSON.parse(str.trim());
            return true;
        } catch (error) {
            return false;
        }
    }

    static parseTags(tags: string): string[] {
        if (Array.isArray(tags)) {
            return tags
        }
        // Check if the tags string contains a JSON-like structure
        if (tags.includes("[") && tags.includes("]")) {
            try {
                // Attempt to parse the string as a JSON array
                const jsonString = tags.replace(/\n/g, "").replace(/\\"/g, '"');
                const parsed = JSON.parse(jsonString.match(/\[.*\]/)?.[0] ?? "[]");
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                console.error("Error parsing JSON tags:", error);
            }
        }

        // Handle numbered list (e.g., "1. Tag\n2. Another Tag\n3. More Tags")
        if (/^\d+\./m.test(tags)) {
            return tags.split(/\n\d+\.\s*/).filter(tag => tag.trim() !== "");
        }

        // If it's a comma-separated string, split it into an array
        if (tags.includes(",")) {
            return tags.split(",").map(tag => tag.trim());
        }

        // If it's a single tag scenario, return it as an array
        return [tags.trim()];
    }
}