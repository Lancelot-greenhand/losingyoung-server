class InputValidation {
    constructor (validation_ops) {
        this.validation_ops = validation_ops
    }
    validate () {
        let i = this.validation_ops.length
        let msg_a = []
        while(i-- >0) {
          let op = this.validation_ops[i]
          let result = op.method(op.value)
          if(result.result !== true) {
              msg_a.push(result.result)
          }
        
        }
        return msg_a.length>0? msg_a: true 
    }
}
module.exports = InputValidation