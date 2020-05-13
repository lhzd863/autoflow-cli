<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Create
      </el-button>
    </div>

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
      <el-table-column label="FlowId" prop="flowid" sortable="custom" align="center" width="200" :class-name="getSortClass('+flowid')" :sort-orders="['ascending', 'descending']">
        <template slot-scope="{row}">
          <span>{{ row.flowid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ImageId" min-width="300px">
        <template slot-scope="{row}">
          <span>{{ row.imageid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="StartTime" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.starttime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="EndTime" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endtime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter" :hit="false" :effect="row.status | statusEffectFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="DBStore" min-width="300px">
        <template slot-scope="{row}">
          <span>{{ row.dbstore }}</span>
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
      <el-table-column label="HomeDir" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.homedir }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Enable" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.enable }}</span>
        </template>
      </el-table-column>
      <el-table-column label="User" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleStart(row)">
            Start
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleStop(row)">
            Stop
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="ImageId" prop="imageid">
          <el-input v-model="temp.imageid" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { scrollTo } from '@/utils/scroll-to'
import defaultConfig from '@/config'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'ImageTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        Done: 'success',
        Ready: 'info',
        Pending: 'info',
        Submit: 'info',
        Go: 'info',
        Fail: 'danger',
        Stop: 'info',
        Running: 'warning'
      }
      return statusMap[status]
    },
    statusEffectFilter(status) {
      const statusEffectMap = {
        Done: 'dark',
        Ready: 'plain',
        Pending: 'light',
        Submit: 'light',
        Go: 'light',
        Fail: 'dark',
        Stop: 'plain',
        Running: 'dark'
      }
      return statusEffectMap[status]
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
      const url = global_system_data_url + '/instance/ls?accesstoken=' + accesstoken
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
          this.$emit('pagination', { page: this.tableQuery.pageIndex, limit: this.tableQuery.pageLimit })
          scrollTo(0, this.tableQuery.pageLimit)
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
        var t_dat = t_data[k]
        for (var t_key in t_dat) {
          if (t_dat[t_key] === null) {
            continue
          }
          if (String(t_dat[t_key]).indexOf(this.tableQuery.title) !== -1) {
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
      console.log(data)
      const { prop, order } = data
      if (prop === 'imageid') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === '+imageid' ? '-imageid' : '+imageid'
      } else if (order === 'ascending') {
        this.tableQuery.sort = '+imageid'
      } else {
        this.tableQuery.sort = '-imageid'
      }
      if (this.tableQuery.sort === '+imageid') {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.imageid.localeCompare(a.imageid) : (b.imageid - a.imageid))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.imageid.localeCompare(b.imageid) : (a.imageid - b.imageid))
      }
    },
    resetTemp() {
      this.temp = {
        tag: '',
        dbstore: '',
        enable: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let accesstoken = ''
          if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
            accesstoken = global_system_accesstoken
          } else {
            accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
          }
          const url = global_system_data_url + '/instance/create?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              imageid: this.temp.imageid
            })
          })
            .then(response => response.json())
            .then((responsedata) => {
              this.dialogFormVisible = false
              if (responsedata.status_code === 200) {
                this.$notify({
                  title: 'Success',
                  message: 'Start Successfully',
                  type: 'success',
                  duration: 2000
                })
              } else {
                this.$notify({
                  title: 'Error',
                  message: responsedata.status_txt,
                  type: 'warning',
                  duration: 2000
                })
              }
              this.getList()
            })
            .catch(function(err) {
              console.log(err)
              this.$notify({
                title: 'Error',
                message: 'Created Error',
                type: 'error',
                duration: 2000
              })
            })
        }
      })
    },
    handleStart(row) {
      this.$confirm('Confirm to start instance?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.instanceStart(row)
        })
        .catch(err => { console.error(err) })
    },
    instanceStart(row) {
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/instance/start?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: row.flowid
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.dialogFormVisible = false
          if (responsedata.status_code === 200) {
            this.$notify({
              title: 'Success',
              message: 'Start Successfully',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'warning',
              duration: 2000
            })
          }
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.$notify({
            title: 'Error',
            message: 'Start Error',
            type: 'error',
            duration: 2000
          })
        })
    },
    handleStop(row) {
      this.$confirm('Confirm to stop instance?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.instanceStop(row)
        })
        .catch(err => { console.error(err) })
    },
    instanceStop(row) {
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/instance/stop?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: row.flowid
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.dialogFormVisible = false
          if (responsedata.status_code === 200) {
            this.$notify({
              title: 'Success',
              message: 'Stop Successfully',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'warning',
              duration: 2000
            })
          }
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.$notify({
            title: 'Error',
            message: 'Stop Error',
            type: 'error',
            duration: 2000
          })
        })
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
