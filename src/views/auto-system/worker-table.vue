<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 20}" :xl="{span: 20}" style="padding-right:8px;margin-bottom:30px;">
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="tableQuery.pageData"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @sort-change="sortChange"
        >
          <el-table-column label="SlaveId" prop="slaveid" sortable="custom" align="center" width="200" :class-name="getSortClass('+slaveid')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.slaveid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Ip" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Port" width="80px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.port }}</span>
            </template>
          </el-table-column>
          <el-table-column label="UpdateTime" width="180px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.updatetime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="RunningCnt" width="80px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.runningcnt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="CurrentCnt" width="80px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.currentcnt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Enable" max-width="50px">
            <template slot-scope="{row}">
              <span>{{ row.enable }}</span>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />
      </el-col>
    </el-row>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import defaultConfig from '@/config'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'ServerTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      tableQuery: {
        title: '',
        sort: '+imageid',
        total: 0,
        srcData: null,
        pageSizes: [10],
        pageIndex: 1,
        pageData: null,
        pageLimit: 10,
        hidden: false,
        layout: 'total, prev, pager, next, jumper'
      },
      sortOptions: [{ label: 'ID Ascending', key: '+imageid' }, { label: 'ID Descending', key: '-imageid' }],
      enableOptions: ['1', '0'],
      temp: {
        imageid: undefined,
        tag: '',
        dbstore: '',
        enable: '1'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/slave/ls?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.tableQuery.srcData = responsedata.data
          this.tableQuery.total = (responsedata.data).length
          this.tableQuery.pageSizes = []
          for (var i = 1; i <= this.tableQuery.total / 10 + 1; i++) {
            this.tableQuery.pageSizes.push(i * 10)
          }
          this.tableQuery.pageData = this.tableQuery.srcData.slice((this.tableQuery.pageIndex - 1) * this.tableQuery.pageLimit, (this.tableQuery.pageIndex) * this.tableQuery.pageLimit)
          this.listLoading = false
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
        })
    },
    handleFilter() {
      if ((this.tableQuery.title).length === 0) {
        this.getList()
        return
      }
      this.tableQuery.pageIndex = 1
      var t_data = this.tableQuery.pageData
      this.tableQuery.pageData = []
      var j = 0
      for (var k = 0; k < (t_data).length; k++) {
        var t_dat1 = t_data[k]
        for (var t_key in t_dat1) {
          if (t_dat1[t_key] === null) {
            continue
          }
          if (String(t_dat1[t_key]).indexOf(this.tableQuery.title) !== -1) {
            this.tableQuery.pageData[j] = t_data[k]
            j++
          }
        }
      }
      this.tableQuery.total = (this.tableQuery.pageData).length
      this.tableQuery.pageSizes = []
      for (var i = 1; i <= this.tableQuery.total / 10 + 1; i++) {
        this.tableQuery.pageSizes.push(i * 10)
      }
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'slaveid') {
        this.sortById(order)
      }
    },
    sortById(order) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === '+slaveid' ? '-slaveid' : '+slaveid'
      } else if (order === 'ascending') {
        this.tableQuery.sort = '+slaveid'
      } else {
        this.tableQuery.sort = '-slaveid'
      }
      if (this.tableQuery.sort === '+slaveid') {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.slaveid.localeCompare(a.slaveid) : (b.slaveid - a.slaveid))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.slaveid.localeCompare(b.slaveid) : (a.slaveid - b.slaveid))
      }
    },
    resetTemp() {
      this.temp = {
        tag: '',
        dbstore: '',
        enable: ''
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
