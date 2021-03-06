<template>
  <div class="app-container">
    <sticky :z-index="10" class-name="sub-navbar">
      <el-dropdown trigger="click">
        <el-button plain>
          Platform<i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="no-border">
          <el-checkbox-group v-model="platforms" style="padding: 5px 15px;">
            <el-checkbox v-for="item in platformsOptions" :key="item.key" :label="item.key">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button plain>
          Link<i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="no-padding no-border" style="width:300px">
          <el-input v-model="url" placeholder="Please enter the content">
            <template slot="prepend">
              Url
            </template>
          </el-input>
        </el-dropdown-menu>
      </el-dropdown>

      <div class="time-container">
        <el-date-picker v-model="time" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Release time" />
      </div>

      <el-button style="margin-left: 10px;" type="success">
        publish
      </el-button>
    </sticky>
    <div class="filter-container">
      <el-input v-model="tableQuery.content" placeholder="Flowid" style="width: 200px;" class="filter-item"/>
      <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
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
      <el-table-column label="Sys" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.sys }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Job" prop="job" sortable="custom" align="center" width="300" :class-name="getSortClass('+job')" :sort-orders="['ascending', 'descending']">
        <template slot-scope="{row}">
          <span>{{ row.job }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Enable" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.enable }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" min-width="80px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter" :hit="false" :effect="row.status | statusEffectFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="RunTime" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.runtime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Server" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.server }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Ip" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Port" min-width="80px">
        <template slot-scope="{row}">
          <span>{{ row.port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="StartTime" min-width="160px">
        <template slot-scope="{row}">
          <span>{{ row.starttime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="EndTime" min-width="160px">
        <template slot-scope="{row}">
          <span>{{ row.endtime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TimeWindow" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.timewindow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="RetryCnt" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.retrycnt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Alert" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.alert }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TimeTrigger" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.timetrigger }}</span>
        </template>
      </el-table-column>
      <el-table-column label="JobType" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.jobtype }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Frequency" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.frequency }}</span>
        </template>
      </el-table-column>
      <el-table-column label="CheckBatStatus" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.checkbatstatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Priority" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column label="RunningCmd" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.runningcmd }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="margin-left:50px;">
        <el-form-item v-if="dialogStatus==='create'?true:false" label="Sys" prop="sys">
          <el-input v-model="temp.sys" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'?true:false" label="Job" prop="job">
          <el-input v-model="temp.job" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'?false:true" label="Sys" prop="sys">
          <span> {{ temp.sys }} </span>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'?false:true" label="Job" prop="job">
          <span> {{ temp.job }} </span>
        </el-form-item>
        <el-form-item label="Enable">
          <el-select v-model="temp.enable" class="filter-item" placeholder="Please select">
            <el-option v-for="item in enableOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-input v-model="temp.status" />
        </el-form-item>
        <el-form-item label="RunTime" prop="runtime">
          <el-input v-model="temp.runtime" />
        </el-form-item>
        <el-form-item label="Server" prop="server">
          <el-input v-model="temp.server" />
        </el-form-item>
        <el-form-item label="Ip" prop="ip">
          <el-input v-model="temp.ip" />
        </el-form-item>
        <el-form-item label="Port" prop="port">
          <el-input v-model="temp.port" />
        </el-form-item>
        <el-form-item label="TimeWindow">
          <el-select v-model="temp.timewindow" class="filter-item" placeholder="Please select">
            <el-option v-for="item in timewindowOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="JobType">
          <el-select v-model="temp.jobtype" class="filter-item" placeholder="Please select">
            <el-option v-for="item in jobtypeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Frequency">
          <el-select v-model="temp.frequency" class="filter-item" placeholder="Please select">
            <el-option v-for="item in frequencyOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="CheckBatStatus">
          <el-select v-model="temp.checkbatstatus" class="filter-item" placeholder="Please select">
            <el-option v-for="item in checkbatstatusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority">
          <el-select v-model="temp.priority" class="filter-item" placeholder="Please select">
            <el-option v-for="item in priorityOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="RunningCmd" prop="runningcmd">
          <el-input v-model="temp.runningcmd" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import defaultConfig from '@/config'
import Sticky from '@/components/Sticky'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'JobTable',
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
      listLoading: false,
      tableQuery: {
        content: '',
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
      enableOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      priorityOptions: [{ label: 'Priority-0', key: '0' }, { label: 'Priority-1', key: '1' },{ label: 'Priority-2', key: '2' },{ label: 'Priority-3', key: '3' },{ label: 'Priority-4', key: '4' }],
      timewindowOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      jobtypeOptions: [{ label: 'Real', key: 'D' }, { label: 'Virtual', key: 'V' }],
      frequencyOptions: [{ label: 'Day', key: 'D' }, { label: 'Month', key: 'M' }],
      checkbatstatusOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      temp: {
        sys: undefined,
        job: '',
        enable: '1',
        status: '',
        runtime: '',
        server: '',
        ip: '',
        port: '',
        timewindow: '',
        retrycnt: '',
        alert: '',
        timetrigger: '',
        jobtype: '',
        frequency: '',
        checkbatstatus: '',
        priority: '',
        runningcmd: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        sys: [{ required: true, message: 'type is required', trigger: 'change' }],
        job: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }]
      }
    }
  },
  created() {
  },
  methods: {
    getList() {
      if ((this.tableQuery.content).length === 0) {
        return
      }
      this.listLoading = true
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/job/ls?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.tableQuery.content
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          if (responsedata.status_code !== 200) {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'error',
              duration: 2000
            })
            return
          }
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
          const url = global_system_data_url + '/image/add?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              tag: this.temp.tag,
              dbstore: this.temp.dbstore,
              enable: this.temp.enable
            })
          })
            .then(response => response.json())
            .then((responsedata) => {
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let accesstoken = ''
          if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
            accesstoken = global_system_accesstoken
          } else {
            accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
          }
          const url = global_system_data_url + '/image/update?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              imageid: this.temp.imageid,
              tag: this.temp.tag,
              dbstore: this.temp.dbstore,
              enable: this.temp.enable
            })
          })
            .then(response => response.json())
            .then((responsedata) => {
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
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
    handleDelete(row, index) {
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/image/rm?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          imageid: row.imageid
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.tableQuery.pageData.splice(index, 1)
        })
        .catch(function(err) {
          console.log(err)
          this.$notify({
            title: 'Error',
            message: 'Delete Error',
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
