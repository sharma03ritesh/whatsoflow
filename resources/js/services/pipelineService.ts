// resources/js/services/pipelineService.ts
import axios from 'axios';
import toast from 'react-hot-toast';

export const pipelineService = {
  async getColumns() {
    try {
      const response = await axios.get('/data/pipeline-columns');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch columns:', error);
      toast.error('Failed to load pipeline columns');
      return [];
    }
  },

  async createColumn(column: any) {
    const response = await axios.post('/data/pipeline-columns', column);
    return response.data;
  },

  async updateColumn(id: string, column: any) {
    const response = await axios.put(`/data/pipeline-columns/${id}`, column);
    return response.data;
  },

  async deleteColumn(id: string) {
    await axios.delete(`/data/pipeline-columns/${id}`);
  },

  async reorderColumns(orderedIds: string[]) {
    await axios.post('/data/pipeline-columns/reorder', { ordered_ids: orderedIds });
  }
};