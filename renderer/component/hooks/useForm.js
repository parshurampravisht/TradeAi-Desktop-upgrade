import _isEqual from "lodash/isEqual"

import { useCallback, useState } from "react"

export function useFormState(initialState) {
  const [formState, setFormState] = useState(initialState)
  const [_initialState, _setInitialState] = useState(initialState)
  const [dirty, setDirty] = useState(false)

  const [errorState, setErrorState] = useState()
  const [ruleState, setRuleState] = useState()

  const checkDirty = useCallback(data => {
    _isEqual(_initialState, data) ? setDirty(false) : setDirty(true)
  }, [])

  const setInitialState = useCallback(data => {
    const newData = { ...formState, ...data }
    _setInitialState(newData)
    handleInputChange(newData)
    setDirty(false)
  }, [])

  const handleInputChange = useCallback(valObj => {
    // clearing all previous error state
    setErrorState(prevState => {
      if (!prevState) return
      const errorState = { ...(prevState || {}) }
      Object.keys(valObj).forEach(key => {
        delete errorState[key]
      })
      return errorState
    })

    setFormState(previousFormState => {
      const newFormState = { ...previousFormState, ...valObj }
      checkDirty(newFormState)
      return newFormState
    })
  }, [])

  const resetState = () => setFormState({})

  const validateForm = () => {
    const _ruleState = ruleState

    const newErrorState = {}
    let isFormValid = true

    for (const _key in _ruleState) {
      const currentKey = _ruleState[_key]
      if (currentKey)
        for (let i = 0; i < currentKey.length; i++) {
          const currentRule = currentKey[i] || {}
          if (!currentRule.func(formState[_key], formState)) {
            newErrorState[_key] = currentRule.msg
            isFormValid = false
            break
          }
        }
    }
    setErrorState({ ...newErrorState })

    return { isFormValid, newErrorState }
  }

  const onSubmit = (onSuccessCb, onErrorCb) => event => {
    // event.preventDefault()
    const { isFormValid, newErrorState } = validateForm()
    if (isFormValid) {
      onSuccessCb(formState)
    } else {
      onErrorCb?.(newErrorState, formState)
    }
  }

  const setRule = (name, rules) => {
    const _ruleState = ruleState || {}
    setRuleState({ ..._ruleState, [name]: rules })
  }

  const setError = (name, errMessage) => {
    setErrorState(prevState => ({
      ...(prevState || {}),
      [name]: errMessage
    }))
  }

  return {
    formState,
    handleInputChange,
    resetState,
    setInitialState,
    dirty,
    error: errorState,
    setRule,
    onSubmit,
    setError
  }
}
